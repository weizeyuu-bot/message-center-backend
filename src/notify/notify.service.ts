import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateNotifyChannelDto } from './dto/create-notify-channel.dto';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import * as crypto from 'crypto';
import * as net from 'net';

const MASKED_SECRET = '__MASKED__';

@Injectable()
export class NotifyService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Channel CRUD ─────────────────────────────────────────

  async findAllChannels() {
    const channels = await this.prisma.notifyChannel.findMany({ orderBy: { createdAt: 'desc' } });
    return channels.map((c) => this._sanitizeChannel(c));
  }

  async findOneChannel(id: string) {
    const ch = await this._getChannelEntity(id);
    if (!ch) throw new NotFoundException('通知通道不存在');
    return this._sanitizeChannel(ch);
  }

  async createChannel(dto: CreateNotifyChannelDto) {
    this._validateConfig(dto.type, dto.configJson);
    const created = await this.prisma.notifyChannel.create({ data: { ...dto } });
    return this._sanitizeChannel(created);
  }

  async updateChannel(id: string, dto: Partial<CreateNotifyChannelDto>) {
    const ch = await this._getChannelEntity(id);
    if (!ch) throw new NotFoundException('通知通道不存在');

    const nextType = dto.type ?? ch.type;
    const nextConfig = dto.configJson
      ? this._mergeConfigForUpdate(nextType, ch.configJson, dto.configJson)
      : ch.configJson;

    this._validateConfig(nextType, nextConfig);

    const updated = await this.prisma.notifyChannel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.configJson !== undefined ? { configJson: nextConfig } : {}),
      },
    });
    return this._sanitizeChannel(updated);
  }

  async deleteChannel(id: string) {
    const ch = await this._getChannelEntity(id);
    if (!ch) throw new NotFoundException('通知通道不存在');
    await this.prisma.notifyChannel.delete({ where: { id } });
    return { success: true };
  }

  async testChannel(id: string) {
    const ch = await this._getChannelEntity(id);
    if (!ch) throw new NotFoundException('通知通道不存在');
    try {
      await this.sendMessage(ch, '测试通知', '这是一条测试消息，数据表如下：\n| 列1 | 列2 |\n|-----|-----|\n| A   | B   |', []);
      return { success: true, message: '发送成功' };
    } catch (err) {
      return { success: false, message: String(err.message) };
    }
  }

  // ─── Send ─────────────────────────────────────────────────

  async sendMessage(
    channel: { type: string; configJson: string },
    title: string,
    markdownBody: string,
    recipients: string[],
  ) {
    if (channel.type === 'EMAIL') {
      await this._sendEmail(channel.configJson, title, markdownBody, recipients);
    } else if (channel.type === 'DINGTALK') {
      await this._sendDingTalk(channel.configJson, title, markdownBody);
    } else if (channel.type === 'WECOM') {
      await this._sendWeCom(channel.configJson, title, markdownBody);
    } else {
      throw new BadRequestException(`不支持的通道类型: ${channel.type}`);
    }
  }

  // ─── Email ────────────────────────────────────────────────

  private async _sendEmail(configJson: string, subject: string, markdown: string, recipients: string[]) {
    const cfg = JSON.parse(configJson);
    const defaultRecipients = Array.isArray(cfg.defaultRecipients)
      ? cfg.defaultRecipients
      : typeof cfg.defaultRecipients === 'string'
        ? cfg.defaultRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    const finalRecipients = (recipients || []).length > 0 ? recipients : defaultRecipients;
    if (finalRecipients.length === 0) {
      throw new BadRequestException('EMAIL 通道未配置收件人邮箱');
    }
    const transport = nodemailer.createTransport({
      host: cfg.smtp.host,
      port: cfg.smtp.port ?? 465,
      secure: cfg.smtp.secure ?? true,
      auth: { user: cfg.smtp.user, pass: cfg.smtp.pass },
    });
    const html = this._markdownToHtml(markdown);
    await transport.sendMail({
      from: cfg.smtp.from ?? cfg.smtp.user,
      to: finalRecipients.join(','),
      subject,
      html,
    });
  }

  // ─── DingTalk ─────────────────────────────────────────────

  private async _sendDingTalk(configJson: string, title: string, markdown: string) {
    const cfg = JSON.parse(configJson);
    let url: string = cfg.webhook;
    if (cfg.secret) {
      const timestamp = Date.now();
      const sign = crypto
        .createHmac('sha256', cfg.secret)
        .update(`${timestamp}\n${cfg.secret}`)
        .digest('base64');
      url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
    }
    await axios.post(url, {
      msgtype: 'markdown',
      markdown: { title, text: markdown },
    });
  }

  // ─── WeCom ────────────────────────────────────────────────

  private async _sendWeCom(configJson: string, title: string, markdown: string) {
    const cfg = JSON.parse(configJson);
    await axios.post(cfg.webhook, {
      msgtype: 'markdown',
      markdown: { content: `## ${title}\n${markdown}` },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────

  buildMarkdownTable(columns: { field: string; label: string }[], rows: Record<string, any>[]): string {
    const header = '| ' + columns.map((c) => c.label).join(' | ') + ' |';
    const sep = '| ' + columns.map(() => '---').join(' | ') + ' |';
    const body = rows
      .map((r) => '| ' + columns.map((c) => String(r[c.field] ?? '')).join(' | ') + ' |')
      .join('\n');
    return [header, sep, body].join('\n');
  }

  private _markdownToHtml(md: string): string {
    // very simple: convert table lines and line breaks
    return md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split('\n')
      .map((line) => {
        if (line.startsWith('|')) return `<tr>${line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map((c) => `<td style="padding:4px 8px;border:1px solid #ddd">${c.trim()}</td>`).join('')}</tr>`;
        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
        return `<p>${line}</p>`;
      })
      .join('')
      .replace(/(<tr>.*?<\/tr>)+/gs, (m) => `<table style="border-collapse:collapse">${m}</table>`);
  }

  private _validateConfig(type: string, configJson: string) {
    try {
      const cfg = JSON.parse(configJson);
      if (type === 'EMAIL') {
        if (!cfg.smtp?.host) throw new Error('EMAIL 配置缺少 smtp.host');
        if (!cfg.smtp?.user) throw new Error('EMAIL 配置缺少 smtp.user');
        if (!cfg.smtp?.pass) throw new Error('EMAIL 配置缺少 smtp.pass');
        if (!cfg.smtp?.from) throw new Error('EMAIL 配置缺少 smtp.from');

        const recipients = Array.isArray(cfg.defaultRecipients)
          ? cfg.defaultRecipients
          : typeof cfg.defaultRecipients === 'string'
            ? cfg.defaultRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];
        if (recipients.length === 0) throw new Error('EMAIL 配置缺少 defaultRecipients');
      }
      if ((type === 'DINGTALK' || type === 'WECOM') && !cfg.webhook) throw new Error('缺少 webhook');
      if ((type === 'DINGTALK' || type === 'WECOM') && cfg.webhook) {
        this._validateWebhookUrl(cfg.webhook);
      }
    } catch (err) {
      throw new BadRequestException(`configJson 格式错误: ${err.message}`);
    }
  }

  private _sanitizeChannel(ch: any) {
    if (!ch) return ch;
    return {
      ...ch,
      configJson: this._sanitizeConfigJson(ch.type, ch.configJson),
    };
  }

  private _sanitizeConfigJson(type: string, configJson: string) {
    try {
      const cfg = JSON.parse(configJson || '{}');
      if (type === 'EMAIL') {
        if (cfg.smtp) {
          cfg.smtp.pass = MASKED_SECRET;
        }
      } else {
        if (cfg.webhook) cfg.webhook = MASKED_SECRET;
        if (cfg.secret) cfg.secret = MASKED_SECRET;
      }
      return JSON.stringify(cfg);
    } catch {
      return configJson;
    }
  }

  private _mergeConfigForUpdate(type: string, oldConfigJson: string, incomingConfigJson: string) {
    try {
      const oldCfg = JSON.parse(oldConfigJson || '{}');
      const incoming = JSON.parse(incomingConfigJson || '{}');

      if (type === 'EMAIL') {
        incoming.smtp = incoming.smtp || {};
        if (incoming.smtp.pass === MASKED_SECRET || !incoming.smtp.pass) {
          incoming.smtp.pass = oldCfg?.smtp?.pass;
        }
      } else {
        if (incoming.webhook === MASKED_SECRET || !incoming.webhook) {
          incoming.webhook = oldCfg?.webhook;
        }
        if (incoming.secret === MASKED_SECRET || incoming.secret === undefined) {
          incoming.secret = oldCfg?.secret;
        }
      }

      return JSON.stringify(incoming);
    } catch {
      return incomingConfigJson;
    }
  }

  private _validateWebhookUrl(rawUrl: string) {
    let u: URL;
    try {
      u = new URL(rawUrl);
    } catch {
      throw new Error('webhook 不是合法 URL');
    }

    if (u.protocol !== 'https:') {
      throw new Error('webhook 仅允许 https 协议');
    }

    if (this._allowPrivateTargets()) {
      return;
    }

    const host = (u.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '::1') {
      throw new Error('webhook 不允许使用本地地址');
    }

    const ipType = net.isIP(host);
    if (ipType > 0 && this._isPrivateIp(host)) {
      throw new Error('webhook 不允许使用内网 IP');
    }
  }

  private _allowPrivateTargets() {
    if ((process.env.ALLOW_PRIVATE_TARGETS || '').toLowerCase() === 'true') {
      return true;
    }
    return (process.env.NODE_ENV || '').toLowerCase() !== 'production';
  }

  private _isPrivateIp(ip: string) {
    return (
      ip.startsWith('10.') ||
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
      ip.startsWith('169.254.') ||
      ip === '::1' ||
      ip.toLowerCase().startsWith('fc') ||
      ip.toLowerCase().startsWith('fd')
    );
  }

  private _getChannelEntity(id: string) {
    return this.prisma.notifyChannel.findUnique({ where: { id } });
  }
}

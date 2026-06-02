import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-datasource.dto';
import { CreateQueryTemplateDto } from './dto/create-query-template.dto';
import * as pg from 'pg';
import * as mysql from 'mysql2/promise';
import * as net from 'net';

const MASKED_SECRET = '__MASKED__';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── DataSource CRUD ──────────────────────────────────────

  async findAllDataSources() {
    const list = await this.prisma.dataSource.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map((d) => this._sanitizeDataSource(d));
  }

  async findOneDataSource(id: string) {
    const ds = await this._getDataSourceEntity(id);
    if (!ds) throw new NotFoundException('数据源不存在');
    return this._sanitizeDataSource(ds);
  }

  async createDataSource(dto: CreateDataSourceDto) {
    this._validateOutboundHost(dto.host, '数据源主机');
    const created = await this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        host: dto.host,
        port: dto.port,
        database: dto.database,
        username: dto.username,
        password: dto.password,
        schema: dto.schema,
        description: dto.description,
      },
    });
    return this._sanitizeDataSource(created);
  }

  async updateDataSource(id: string, dto: Partial<CreateDataSourceDto>) {
    const existing = await this._getDataSourceEntity(id);
    if (!existing) throw new NotFoundException('数据源不存在');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.host !== undefined) {
      this._validateOutboundHost(dto.host, '数据源主机');
      data.host = dto.host;
    }
    if (dto.port !== undefined) data.port = dto.port;
    if (dto.database !== undefined) data.database = dto.database;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.password !== undefined) {
      const trimmed = String(dto.password || '').trim();
      if (trimmed && trimmed !== MASKED_SECRET) {
        data.password = dto.password;
      }
    }
    if (dto.schema !== undefined) data.schema = dto.schema;
    if (dto.description !== undefined) data.description = dto.description;
    const updated = await this.prisma.dataSource.update({ where: { id }, data });
    return this._sanitizeDataSource(updated);
  }

  async deleteDataSource(id: string) {
    const exists = await this._getDataSourceEntity(id);
    if (!exists) throw new NotFoundException('数据源不存在');

    const templateCount = await this.prisma.queryTemplate.count({ where: { dataSourceId: id } });
    if (templateCount > 0) {
      throw new BadRequestException(`当前数据源已关联 ${templateCount} 个查询模板，请先删除或迁移查询模板后再删除数据源`);
    }

    await this.prisma.dataSource.delete({ where: { id } });
    return { success: true };
  }

  async testConnection(id: string) {
    const ds = await this._getDataSourceEntity(id);
    if (!ds) throw new NotFoundException('数据源不存在');
    try {
      await this._runQuery(ds, 'SELECT 1', []);
      return { success: true, message: '连接成功' };
    } catch (err) {
      return { success: false, message: String(err.message) };
    }
  }

  // ─── QueryTemplate CRUD ───────────────────────────────────

  async findAllQueryTemplates(dataSourceId?: string) {
    return this.prisma.queryTemplate.findMany({
      where: dataSourceId ? { dataSourceId } : undefined,
      include: { dataSource: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneQueryTemplate(id: string) {
    const qt = await this.prisma.queryTemplate.findUnique({
      where: { id },
      include: { dataSource: true },
    });
    if (!qt) throw new NotFoundException('查询模板不存在');
    return {
      ...qt,
      dataSource: qt.dataSource ? this._sanitizeDataSource(qt.dataSource as any) : null,
    };
  }

  async createQueryTemplate(dto: CreateQueryTemplateDto) {
    const { columns } = dto;
    return this.prisma.queryTemplate.create({
      data: {
        name: dto.name,
        dataSourceId: dto.dataSourceId,
        sql: dto.sql,
        messageTemplate: dto.messageTemplate,
        description: dto.description,
        columnsJson: columns ? JSON.stringify(columns) : null,
      },
    });
  }

  async updateQueryTemplate(id: string, dto: Partial<CreateQueryTemplateDto>) {
    await this.findOneQueryTemplate(id);
    const { columns } = dto;
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.dataSourceId !== undefined) data.dataSourceId = dto.dataSourceId;
    if (dto.sql !== undefined) data.sql = dto.sql;
    if (dto.messageTemplate !== undefined) data.messageTemplate = dto.messageTemplate;
    if (dto.description !== undefined) data.description = dto.description;
    if (columns !== undefined) {
      data.columnsJson = JSON.stringify(columns);
    } else if (dto.sql !== undefined) {
      // If SQL changed but no explicit column mapping is provided,
      // clear stale mapping so preview/display follows latest query fields.
      data.columnsJson = null;
    }
    return this.prisma.queryTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteQueryTemplate(id: string) {
    await this.findOneQueryTemplate(id);

    const taskCount = await this.prisma.scheduledTask.count({ where: { queryTemplateId: id } });
    if (taskCount > 0) {
      throw new BadRequestException(`当前查询模板已关联 ${taskCount} 个定时任务，请先删除或改绑任务后再删除查询模板`);
    }

    await this.prisma.queryTemplate.delete({ where: { id } });
    return { success: true };
  }

  async previewQuery(id: string, limit = 50) {
    const qt = await this._getQueryTemplateEntity(id);
    if (!qt) throw new NotFoundException('查询模板不存在');
    if (!qt.dataSource) throw new BadRequestException('关联数据源不存在');
    const safeSql = this._wrapLimit(qt.sql, limit);
    const rows = await this._runQuery(qt.dataSource as any, safeSql, []);
    const inferredColumns = Object.keys(rows[0] ?? {}).map((f) => ({ field: f, label: f }));
    let columns = inferredColumns;
    if (qt.columnsJson) {
      try {
        const parsed = JSON.parse(qt.columnsJson);
        if (Array.isArray(parsed)) {
          const labelMap = new Map<string, any>();
          parsed.forEach((c) => {
            if (c && typeof c.field === 'string') {
              labelMap.set(c.field, c);
            }
          });
          // Always follow current query result fields and keep custom labels when available.
          columns = inferredColumns.map((c) => {
            const mapped = labelMap.get(c.field);
            if (!mapped) return c;
            return {
              field: c.field,
              label: mapped.label || c.field,
              width: mapped.width,
            };
          });
        }
      } catch {
        columns = inferredColumns;
      }
    }
    const title = qt.name;
    const messagePreview = this._renderMessageTemplate(
      qt.messageTemplate || this._defaultMessageTemplate(),
      {
        title,
        rowCount: String(rows.length),
        table: this._buildMarkdownTableForTemplate(columns, rows),
        time: new Date().toLocaleString('zh-CN'),
      },
    );
    return { columns, rows, messagePreview };
  }

  // ─── Internal helpers ────────────────────────────────────

  async runQueryById(templateId: string, title?: string): Promise<{ columns: any[]; rows: any[]; messageBody: string }> {
    const qt = await this._getQueryTemplateEntity(templateId);
    if (!qt) throw new NotFoundException('查询模板不存在');
    if (!qt.dataSource) throw new BadRequestException('关联数据源不存在');
    const safeSql = this._wrapLimit(qt.sql, 5000);
    const rows = await this._runQuery(qt.dataSource as any, safeSql, []);
    const columns = qt.columnsJson
      ? (() => {
          try {
            const parsed = JSON.parse(qt.columnsJson || '[]');
            const rowKeys = new Set(Object.keys(rows[0] ?? {}));
            const labelMap = new Map<string, any>();
            if (Array.isArray(parsed)) {
              parsed.forEach((c) => {
                if (c && typeof c.field === 'string' && rowKeys.has(c.field)) {
                  labelMap.set(c.field, c);
                }
              });
            }
            return Object.keys(rows[0] ?? {}).map((f) => ({
              field: f,
              label: labelMap.get(f)?.label || f,
              width: labelMap.get(f)?.width,
            }));
          } catch {
            return Object.keys(rows[0] ?? {}).map((f) => ({ field: f, label: f }));
          }
        })()
      : Object.keys(rows[0] ?? {}).map((f) => ({ field: f, label: f }));

    const messageBody = this._renderMessageTemplate(
      qt.messageTemplate || this._defaultMessageTemplate(),
      {
        title: title || qt.name,
        rowCount: String(rows.length),
        table: this._buildMarkdownTableForTemplate(columns, rows),
        time: new Date().toLocaleString('zh-CN'),
      },
    );
    return { columns, rows, messageBody };
  }

  private _defaultMessageTemplate() {
    return '## {{title}}\n\n推送时间：{{time}}\n\n共 **{{rowCount}}** 条记录\n\n{{table}}';
  }

  private _renderMessageTemplate(template: string, vars: Record<string, string>) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => vars[key] ?? '');
  }

  private _buildMarkdownTableForTemplate(columns: { field: string; label: string }[], rows: Record<string, any>[]) {
    const header = '| ' + columns.map((c) => c.label).join(' | ') + ' |';
    const sep = '| ' + columns.map(() => '---').join(' | ') + ' |';
    const body = rows
      .map((r) => '| ' + columns.map((c) => String(r[c.field] ?? '')).join(' | ') + ' |')
      .join('\n');
    return [header, sep, body].join('\n');
  }

  private _wrapLimit(sql: string, limit: number): string {
    const trimmed = sql.trim().replace(/;$/, '');
    return `SELECT * FROM (${trimmed}) _q LIMIT ${limit}`;
  }

  async _runQuery(ds: { type: string; host: string; port: number; database: string; username: string; password: string; schema?: string | null }, sql: string, _params: any[]) {
    if (ds.type === 'POSTGRESQL') {
      const pool = new pg.Pool({
        host: ds.host,
        port: ds.port,
        database: ds.database,
        user: ds.username,
        password: ds.password,
        connectionTimeoutMillis: 5000,
      });
      try {
        const res = await pool.query(sql);
        return res.rows;
      } finally {
        await pool.end();
      }
    } else if (ds.type === 'MYSQL') {
      const conn = await mysql.createConnection({
        host: ds.host,
        port: ds.port,
        database: ds.database,
        user: ds.username,
        password: ds.password,
        connectTimeout: 5000,
      });
      try {
        const [rows] = await conn.execute(sql);
        return rows as any[];
      } finally {
        await conn.end();
      }
    } else {
      throw new BadRequestException(`暂不支持数据库类型: ${ds.type}`);
    }
  }

  private _sanitizeDataSource(ds: any) {
    if (!ds) return ds;
    return {
      ...ds,
      password: MASKED_SECRET,
    };
  }

  private _getDataSourceEntity(id: string) {
    return this.prisma.dataSource.findUnique({ where: { id } });
  }

  private _getQueryTemplateEntity(id: string) {
    return this.prisma.queryTemplate.findUnique({
      where: { id },
      include: { dataSource: true },
    });
  }

  private _validateOutboundHost(host: string, fieldName: string) {
    const value = String(host || '').trim().toLowerCase();
    if (!value) {
      throw new BadRequestException(`${fieldName} 不能为空`);
    }

    if (this._allowPrivateTargets()) {
      return;
    }

    if (value === 'localhost' || value === '::1') {
      throw new BadRequestException(`${fieldName} 不允许使用本地地址`);
    }

    const ipType = net.isIP(value);
    if (ipType > 0 && this._isPrivateIp(value)) {
      throw new BadRequestException(`${fieldName} 不允许使用内网 IP`);
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
}

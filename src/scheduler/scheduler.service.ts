import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../common/prisma/prisma.service';
import { DataSourceService } from '../datasource/datasource.service';
import { NotifyService } from '../notify/notify.service';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dsService: DataSourceService,
    private readonly notifyService: NotifyService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    const tasks = await this.prisma.scheduledTask.findMany({ where: { status: 'ACTIVE' } });
    for (const task of tasks) {
      this._registerCron(task);
    }
    this.logger.log(`已加载 ${tasks.length} 个定时任务`);
  }

  // ─── CRUD ─────────────────────────────────────────────────

  async findAll() {
    return this.prisma.scheduledTask.findMany({
      include: {
        queryTemplate: { select: { id: true, name: true } },
        channel: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.scheduledTask.findUnique({
      where: { id },
      include: { queryTemplate: true, channel: true, runLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!task) throw new NotFoundException('定时任务不存在');
    return task;
  }

  async create(dto: CreateScheduledTaskDto) {
    const task = await this.prisma.scheduledTask.create({
      data: this._buildTaskData(dto, true),
    });
    this._registerCron(task);
    return task;
  }

  async update(id: string, dto: Partial<CreateScheduledTaskDto>) {
    await this.findOne(id);
    const task = await this.prisma.scheduledTask.update({
      where: { id },
      data: this._buildTaskData(dto, false),
    });
    this._unregisterCron(id);
    if (task.status === 'ACTIVE') this._registerCron(task);
    return task;
  }

  async remove(id: string) {
    await this.findOne(id);
    this._unregisterCron(id);
    return this.prisma.scheduledTask.delete({ where: { id } });
  }

  async toggleStatus(id: string) {
    const task = await this.findOne(id);
    const newStatus = task.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = await this.prisma.scheduledTask.update({ where: { id }, data: { status: newStatus } });
    this._unregisterCron(id);
    if (newStatus === 'ACTIVE') this._registerCron(updated);
    return updated;
  }

  async manualRun(id: string) {
    const task = await this.findOne(id);
    return this._executeTask(task as any);
  }

  async getRunLogs(taskId: string) {
    return this.prisma.taskRunLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── Execution ────────────────────────────────────────────

  private async _executeTask(task: { id: string; queryTemplateId: string; channelId: string; recipients: string; messageTitle: string | null }) {
    const startedAt = new Date();
    let status = 'SUCCESS';
    let rowCount = 0;
    let message = '';
    let content = '';
    try {
      const title = task.messageTitle || '消息中心自动推送';
      const { rows, messageBody } = await this.dsService.runQueryById(task.queryTemplateId, title);
      content = messageBody;
      rowCount = rows.length;
      const channel = await this.prisma.notifyChannel.findUnique({ where: { id: task.channelId } });
      if (!channel) throw new Error('通知通道不存在');
      const recipients = task.recipients ? task.recipients.split(',').map((s) => s.trim()).filter(Boolean) : [];
      await this.notifyService.sendMessage(channel, title, messageBody, recipients);
      message = `成功发送 ${rowCount} 条记录`;
    } catch (err) {
      status = 'FAILED';
      message = String(err.message);
      this.logger.error(`任务 ${task.id} 执行失败: ${message}`);
    }
    const log = await this.prisma.taskRunLog.create({
      data: { taskId: task.id, status, rowCount, message, content, startedAt, finishedAt: new Date() },
    });
    await this.prisma.scheduledTask.update({
      where: { id: task.id },
      data: { lastRunAt: startedAt, lastRunStatus: status },
    });
    return log;
  }

  // ─── CronJob helpers ──────────────────────────────────────

  private _registerCron(task: { id: string; cronExpr: string }) {
    try {
      const job = new CronJob(task.cronExpr, () => {
        this._executeTask(task as any).catch((e) => this.logger.error(e.message));
      });
      this.schedulerRegistry.addCronJob(`task_${task.id}`, job);
      job.start();
    } catch (err) {
      this.logger.warn(`任务 ${task.id} Cron 表达式无效: ${err.message}`);
    }
  }

  private _unregisterCron(taskId: string) {
    try {
      this.schedulerRegistry.deleteCronJob(`task_${taskId}`);
    } catch (_) {}
  }

  private _buildTaskData(dto: Partial<CreateScheduledTaskDto>, isCreate: boolean) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.cronExpr !== undefined) data.cronExpr = dto.cronExpr;
    if (dto.queryTemplateId !== undefined) data.queryTemplateId = dto.queryTemplateId;
    if (dto.channelId !== undefined) data.channelId = dto.channelId;
    if (dto.recipients !== undefined) data.recipients = dto.recipients;
    if (dto.messageTitle !== undefined) data.messageTitle = dto.messageTitle;

    if (isCreate && data.recipients === undefined) {
      data.recipients = '';
    }

    return data;
  }
}

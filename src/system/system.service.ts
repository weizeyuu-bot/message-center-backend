import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { PrismaService } from '../common/prisma/prisma.service';

type LoginStatus = 'LOGGED_IN' | 'LOGGED_OUT';

interface SessionRecord {
  userId: string;
  username: string;
  loginTime: Date;
  ipAddress: string;
  lastActivity: Date;
}

interface LoginHistoryRecord {
  username: string;
  loginTime: Date;
  ipAddress: string;
  status: LoginStatus;
}

@Injectable()
export class SystemService {
  private readonly appStartedAt = new Date();
  private readonly activeSessions = new Map<string, SessionRecord>();
  private readonly loginHistory: LoginHistoryRecord[] = [];

  constructor(private readonly prisma: PrismaService) {}

  recordLogin(user: { id: string; username: string }, ipAddress?: string) {
    const now = new Date();
    const normalizedIp = this.normalizeIp(ipAddress);
    this.activeSessions.set(user.id, {
      userId: user.id,
      username: user.username,
      loginTime: now,
      ipAddress: normalizedIp,
      lastActivity: now,
    });
    this.loginHistory.unshift({
      username: user.username,
      loginTime: now,
      ipAddress: normalizedIp,
      status: 'LOGGED_IN',
    });
    if (this.loginHistory.length > 200) {
      this.loginHistory.length = 200;
    }
  }

  touchSession(user: { id: string; username: string }, ipAddress?: string) {
    const now = new Date();
    const existing = this.activeSessions.get(user.id);
    if (!existing) {
      this.recordLogin(user, ipAddress);
      return;
    }
    existing.lastActivity = now;
    if (ipAddress) {
      existing.ipAddress = this.normalizeIp(ipAddress);
    }
    this.activeSessions.set(user.id, existing);
  }

  async getOverview() {
    const now = new Date();
    const sessions = [...this.activeSessions.values()];
    const usage = process.memoryUsage();
    const cpuCount = Math.max(os.cpus().length, 1);
    const load = os.loadavg()[0] || 0;
    const cpuUsageValue = Math.max(0, Math.min(100, Number(((load / cpuCount) * 100).toFixed(1))));
    const memoryUsageValue = Math.max(
      0,
      Math.min(100, Number(((usage.rss / Math.max(os.totalmem(), 1)) * 100).toFixed(1))),
    );

    const logs = await this.prisma.taskRunLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { task: { select: { name: true } } },
    });

    return {
      onlineUsers: sessions.length,
      systemUptime: this.formatUptime(process.uptime()),
      cpuUsage: `${cpuUsageValue}%`,
      cpuUsageValue,
      memoryUsage: `${memoryUsageValue}%`,
      memoryUsageValue,
      loginHistory: this.loginHistory.slice(0, 50).map((item) => ({
        username: item.username,
        loginTime: item.loginTime.toISOString(),
        ipAddress: item.ipAddress,
        status: item.status,
        statusState: item.status === 'LOGGED_IN' ? 'Success' : 'None',
        duration: item.status === 'LOGGED_IN' ? this.formatDurationMinutes((now.getTime() - item.loginTime.getTime()) / 60000) : '-',
      })),
      onlineUsersList: sessions.map((item) => ({
        username: item.username,
        loginTime: item.loginTime.toISOString(),
        ipAddress: item.ipAddress,
        lastActivity: item.lastActivity.toISOString(),
      })),
      systemLogs: logs.map((item) => ({
        timestamp: item.createdAt.toISOString(),
        level: item.status === 'FAILED' ? 'ERROR' : 'INFO',
        levelState: item.status === 'FAILED' ? 'Error' : 'Success',
        module: 'Scheduler',
        message: item.message || `${item.task?.name || '任务'} 执行完成`,
      })),
      appStartedAt: this.appStartedAt.toISOString(),
    };
  }

  private normalizeIp(ipAddress?: string) {
    return String(ipAddress || '').replace('::ffff:', '') || 'Unknown';
  }

  private formatUptime(uptimeSeconds: number) {
    const totalMinutes = Math.max(0, Math.floor(uptimeSeconds / 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  }

  private formatDurationMinutes(minutesRaw: number) {
    const minutes = Math.max(0, Math.floor(minutesRaw));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

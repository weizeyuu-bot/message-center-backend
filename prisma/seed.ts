import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { mockRoles, mockUsers } from './mock-data';

const prisma = new PrismaClient();

async function upsertUsersAndRoles() {
  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const adminName = process.env.ADMIN_NAME ?? '系统管理员';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
  const adminRole = process.env.ADMIN_ROLE ?? 'ROLE_ADMIN';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPhone = process.env.ADMIN_PHONE ?? '13800000001';
  const adminDepartment = process.env.ADMIN_DEPARTMENT ?? '系统管理';

  for (const role of mockRoles) {
    await prisma.appRole.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
        permissionJson: JSON.stringify(role.permissions),
      },
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissionJson: JSON.stringify(role.permissions),
      },
    });
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      department: adminDepartment,
      role: adminRole,
      status: 'ACTIVE',
      passwordHash: adminPasswordHash,
    },
    create: {
      username: adminUsername,
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      department: adminDepartment,
      role: adminRole,
      status: 'ACTIVE',
      passwordHash: adminPasswordHash,
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
    },
  });

  for (const user of mockUsers) {
    if (user.username === adminUsername) {
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        passwordHash,
      },
      create: {
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        passwordHash,
      },
    });
  }

  return admin;
}

async function upsertMessageCenterCoreData() {
  const dataSource = await prisma.dataSource.upsert({
    where: { name: 'message-center-db-local' },
    update: {
      type: 'POSTGRESQL',
      host: '127.0.0.1',
      port: 5434,
      database: 'purchase_db',
      username: 'purchase',
      password: 'purchase',
      schema: 'public',
      description: '消息中心本地数据库连接',
      status: 'ACTIVE',
    },
    create: {
      name: 'message-center-db-local',
      type: 'POSTGRESQL',
      host: '127.0.0.1',
      port: 5434,
      database: 'purchase_db',
      username: 'purchase',
      password: 'purchase',
      schema: 'public',
      description: '消息中心本地数据库连接',
      status: 'ACTIVE',
    },
  });

  const queryTemplate = await prisma.queryTemplate.upsert({
    where: { id: 'qt-message-center-role-stats' },
    update: {
      name: '用户角色统计',
      dataSourceId: dataSource.id,
      sql: 'SELECT role, COUNT(*) AS total_count FROM "User" GROUP BY role ORDER BY role',
      columnsJson: JSON.stringify([
        { field: 'role', label: '角色', width: '180px' },
        { field: 'total_count', label: '数量', width: '120px' },
      ]),
      messageTemplate:
        '### 消息中心角色统计\n\n- 统计时间: {{time}}\n- 结果行数: {{rowCount}}\n\n{{table}}',
      description: '统计系统内各角色用户数量',
      status: 'ACTIVE',
    },
    create: {
      id: 'qt-message-center-role-stats',
      name: '用户角色统计',
      dataSourceId: dataSource.id,
      sql: 'SELECT role, COUNT(*) AS total_count FROM "User" GROUP BY role ORDER BY role',
      columnsJson: JSON.stringify([
        { field: 'role', label: '角色', width: '180px' },
        { field: 'total_count', label: '数量', width: '120px' },
      ]),
      messageTemplate:
        '### 消息中心角色统计\n\n- 统计时间: {{time}}\n- 结果行数: {{rowCount}}\n\n{{table}}',
      description: '统计系统内各角色用户数量',
      status: 'ACTIVE',
    },
  });

  const dingTalkChannel = await prisma.notifyChannel.upsert({
    where: { name: '消息中心钉钉通道' },
    update: {
      type: 'DINGTALK',
      configJson: JSON.stringify({
        webhook: 'https://oapi.dingtalk.com/robot/send?access_token=message-center-dingtalk-token',
      }),
      description: '消息中心钉钉通知通道',
      status: 'ACTIVE',
    },
    create: {
      name: '消息中心钉钉通道',
      type: 'DINGTALK',
      configJson: JSON.stringify({
        webhook: 'https://oapi.dingtalk.com/robot/send?access_token=message-center-dingtalk-token',
      }),
      description: '消息中心钉钉通知通道',
      status: 'ACTIVE',
    },
  });

  await prisma.notifyChannel.upsert({
    where: { name: '消息中心邮件通道' },
    update: {
      type: 'EMAIL',
      configJson: JSON.stringify({
        smtp: {
          host: 'smtp.message-center.local',
          port: 465,
          secure: true,
          user: 'notify@message-center.local',
          pass: 'message-center-notify-password',
          from: 'Message Center <notify@message-center.local>',
        },
        defaultRecipients: ['ops1@message-center.local', 'ops2@message-center.local'],
      }),
      description: '消息中心邮件通知通道',
      status: 'ACTIVE',
    },
    create: {
      name: '消息中心邮件通道',
      type: 'EMAIL',
      configJson: JSON.stringify({
        smtp: {
          host: 'smtp.message-center.local',
          port: 465,
          secure: true,
          user: 'notify@message-center.local',
          pass: 'message-center-notify-password',
          from: 'Message Center <notify@message-center.local>',
        },
        defaultRecipients: ['ops1@message-center.local', 'ops2@message-center.local'],
      }),
      description: '消息中心邮件通知通道',
      status: 'ACTIVE',
    },
  });

  const activeTask = await prisma.scheduledTask.upsert({
    where: { name: '工作日早八点推送-角色统计' },
    update: {
      cronExpr: '0 8 * * 1-5',
      queryTemplateId: queryTemplate.id,
      channelId: dingTalkChannel.id,
      recipients: '',
      messageTitle: '角色统计日报',
      status: 'ACTIVE',
      nextRunAt: null,
    },
    create: {
      name: '工作日早八点推送-角色统计',
      cronExpr: '0 8 * * 1-5',
      queryTemplateId: queryTemplate.id,
      channelId: dingTalkChannel.id,
      recipients: '',
      messageTitle: '角色统计日报',
      status: 'ACTIVE',
      nextRunAt: null,
    },
  });

  const pausedTask = await prisma.scheduledTask.upsert({
    where: { name: '每小时巡检-角色统计(暂停)' },
    update: {
      cronExpr: '0 * * * *',
      queryTemplateId: queryTemplate.id,
      channelId: dingTalkChannel.id,
      recipients: '',
      messageTitle: '角色统计巡检',
      status: 'PAUSED',
      nextRunAt: null,
    },
    create: {
      name: '每小时巡检-角色统计(暂停)',
      cronExpr: '0 * * * *',
      queryTemplateId: queryTemplate.id,
      channelId: dingTalkChannel.id,
      recipients: '',
      messageTitle: '角色统计巡检',
      status: 'PAUSED',
      nextRunAt: null,
    },
  });

  await prisma.taskRunLog.deleteMany({
    where: { taskId: { in: [activeTask.id, pausedTask.id] } },
  });

  const now = new Date();
  await prisma.taskRunLog.createMany({
    data: [
      {
        taskId: activeTask.id,
        status: 'SUCCESS',
        rowCount: 3,
        message: '推送成功',
        startedAt: new Date(now.getTime() - 60 * 60 * 1000),
        finishedAt: new Date(now.getTime() - 60 * 60 * 1000 + 10 * 1000),
      },
      {
        taskId: activeTask.id,
        status: 'FAILED',
        rowCount: 0,
        message: 'Webhook 未配置或不可达',
        startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        finishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 8 * 1000),
      },
    ],
  });

  return {
    dataSources: await prisma.dataSource.count(),
    queryTemplates: await prisma.queryTemplate.count(),
    notifyChannels: await prisma.notifyChannel.count(),
    tasks: await prisma.scheduledTask.count(),
    taskRunLogs: await prisma.taskRunLog.count(),
  };
}

async function main() {
  const admin = await upsertUsersAndRoles();
  const messageCenter = await upsertMessageCenterCoreData();

  console.log('Seeded base admin user:', admin);
  console.log('Seeded message center data:', messageCenter);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

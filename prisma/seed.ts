import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  mockDeliveryPlans,
  mockDeployments,
  mockFormConfigs,
  mockInvoices,
  mockMaterials,
  mockPriceRecords,
  mockProcessCategories,
  mockProcessInstances,
  mockProcessModels,
  mockProcessNodes,
  mockPurchaseOrders,
  mockRoles,
  mockSuppliers,
  mockUsers,
} from './mock-data';

const prisma = new PrismaClient();

function toDate(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.includes(' ') ? value.replace(' ', 'T') : `${value}T00:00:00`;
  return new Date(normalized);
}

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const adminName = process.env.ADMIN_NAME ?? '系统管理员';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
  const adminRole = process.env.ADMIN_ROLE ?? 'ROLE_ADMIN';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPhone = process.env.ADMIN_PHONE ?? '13800000001';
  const adminDepartment = process.env.ADMIN_DEPARTMENT ?? '系统管理';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const updateData: any = {
    name: adminName,
    email: adminEmail,
    phone: adminPhone,
    department: adminDepartment,
    role: adminRole,
    status: 'ACTIVE',
    passwordHash,
  };
  const createData: any = {
    username: adminUsername,
    name: adminName,
    email: adminEmail,
    phone: adminPhone,
    department: adminDepartment,
    role: adminRole,
    status: 'ACTIVE',
    passwordHash,
  };

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: updateData,
    create: createData,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
    },
  });

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

  for (const user of mockUsers) {
    if (user.username === adminUsername) {
      continue;
    }

    const userPasswordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        passwordHash: userPasswordHash,
      },
      create: {
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        passwordHash: userPasswordHash,
      },
    });
  }

  for (const supplier of mockSuppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: supplier,
      create: supplier,
    });
  }

  for (const material of mockMaterials) {
    await prisma.material.upsert({
      where: { id: material.id },
      update: material,
      create: material,
    });
  }

  for (const record of mockPriceRecords) {
    await prisma.priceRecord.upsert({
      where: { id: record.id },
      update: {
        supplierId: record.supplierId,
        materialId: record.materialId,
        unit: record.unit,
        validFrom: toDate(record.validFrom)!,
        validTo: toDate(record.validTo)!,
        unitPrice: record.unitPrice,
        currency: record.currency,
        taxRate: record.taxRate,
        remark: record.remark,
      },
      create: {
        id: record.id,
        supplierId: record.supplierId,
        materialId: record.materialId,
        unit: record.unit,
        validFrom: toDate(record.validFrom)!,
        validTo: toDate(record.validTo)!,
        unitPrice: record.unitPrice,
        currency: record.currency,
        taxRate: record.taxRate,
        remark: record.remark,
      },
    });
  }

  for (const category of mockProcessCategories) {
    await prisma.processCategory.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        description: category.description,
        owner: category.owner,
        status: 'ACTIVE',
      },
      create: {
        id: category.id,
        name: category.name,
        description: category.description,
        owner: category.owner,
        status: 'ACTIVE',
      },
    });
  }

  for (const form of mockFormConfigs) {
    await prisma.formConfig.upsert({
      where: { id: form.id },
      update: {
        name: form.name,
        categoryId: form.categoryId,
        schemaJson: JSON.stringify({ fields: form.fields }),
        businessObject: form.businessObject,
        initiatorRole: form.initiatorRole,
        approverRole: form.approverRole,
        status: 'ACTIVE',
      },
      create: {
        id: form.id,
        name: form.name,
        categoryId: form.categoryId,
        schemaJson: JSON.stringify({ fields: form.fields }),
        businessObject: form.businessObject,
        initiatorRole: form.initiatorRole,
        approverRole: form.approverRole,
        status: 'ACTIVE',
      },
    });
  }

  for (const model of mockProcessModels) {
    await prisma.processModel.upsert({
      where: { id: model.id },
      update: {
        name: model.name,
        formId: model.formId,
        version: model.version,
        status: model.status,
        businessObject: model.businessObject,
        initiatorRole: model.initiatorRole,
        approverRole: model.approverRole,
        nodeCount: model.nodeCount,
        description: model.description,
      },
      create: {
        id: model.id,
        name: model.name,
        formId: model.formId,
        version: model.version,
        status: model.status,
        businessObject: model.businessObject,
        initiatorRole: model.initiatorRole,
        approverRole: model.approverRole,
        nodeCount: model.nodeCount,
        description: model.description,
      },
    });
  }

  for (const node of mockProcessNodes) {
    await prisma.processNode.upsert({
      where: { id: node.id },
      update: {
        modelId: node.modelId,
        nodeKey: node.nodeKey,
        nodeName: node.nodeName,
        nodeType: node.nodeType,
        nodeAction: node.nodeAction,
        assigneeRole: node.assigneeRole,
        nodePolicy: node.nodePolicy,
        branchSet: node.branchSet,
        branchGroup: node.branchGroup,
        branchMergeTo: node.branchMergeTo,
        conditionField: node.conditionField,
        conditionOperator: node.conditionOperator,
        conditionValue: node.conditionValue,
        conditionIsDefault: node.conditionIsDefault,
        sla: node.sla,
      },
      create: {
        id: node.id,
        modelId: node.modelId,
        nodeKey: node.nodeKey,
        nodeName: node.nodeName,
        nodeType: node.nodeType,
        nodeAction: node.nodeAction,
        assigneeRole: node.assigneeRole,
        nodePolicy: node.nodePolicy,
        branchSet: node.branchSet,
        branchGroup: node.branchGroup,
        branchMergeTo: node.branchMergeTo,
        conditionField: node.conditionField,
        conditionOperator: node.conditionOperator,
        conditionValue: node.conditionValue,
        conditionIsDefault: node.conditionIsDefault,
        sla: node.sla,
      },
    });
  }

  for (const deployment of mockDeployments) {
    await prisma.deployment.upsert({
      where: { deploymentId: deployment.deploymentId },
      update: {
        id: deployment.id,
        modelId: deployment.modelId,
        environment: deployment.environment,
        scope: deployment.scope,
        deployTime: toDate(deployment.deployTime),
        publishedBy: deployment.publishedBy,
        status: deployment.status,
      },
      create: {
        id: deployment.id,
        deploymentId: deployment.deploymentId,
        modelId: deployment.modelId,
        environment: deployment.environment,
        scope: deployment.scope,
        deployTime: toDate(deployment.deployTime),
        publishedBy: deployment.publishedBy,
        status: deployment.status,
      },
    });
  }

  for (const instance of mockProcessInstances) {
    await prisma.processInstance.upsert({
      where: { id: instance.id },
      update: {
        modelId: instance.modelId,
        businessId: instance.businessId,
        currentNode: instance.currentNode,
        initiator: instance.initiator,
        initiatorRole: instance.initiatorRole,
        currentHandler: instance.currentHandler,
        statusText: instance.statusText,
        statusState: instance.statusState,
        submittedAt: toDate(instance.submittedAt),
      },
      create: {
        id: instance.id,
        modelId: instance.modelId,
        businessId: instance.businessId,
        currentNode: instance.currentNode,
        initiator: instance.initiator,
        initiatorRole: instance.initiatorRole,
        currentHandler: instance.currentHandler,
        statusText: instance.statusText,
        statusState: instance.statusState,
        submittedAt: toDate(instance.submittedAt),
      },
    });
  }

  for (const order of mockPurchaseOrders) {
    await prisma.purchaseOrder.upsert({
      where: { id: order.id },
      update: {
        supplierId: order.supplierId,
        orderDate: toDate(order.orderDate)!,
        status: order.status,
        approvalStatus: order.approvalStatus,
        approvalStatusText: order.approvalStatusText,
        approvalStatusState: order.approvalStatusState,
        processInstanceId: order.processInstanceId || null,
        processModelId: order.processModelId || null,
        processModelName: order.processModelName || null,
        createdBy: order.createdBy || null,
        creatorRole: order.creatorRole || null,
        submittedBy: order.submittedBy || null,
        submittedAt: toDate(order.submittedAt),
        currentApprover: order.currentApprover || null,
        currentApproverRole: order.currentApproverRole || null,
        approvedBy: order.approvedBy || null,
        approvedAt: toDate(order.approvedAt),
      },
      create: {
        id: order.id,
        supplierId: order.supplierId,
        orderDate: toDate(order.orderDate)!,
        status: order.status,
        approvalStatus: order.approvalStatus,
        approvalStatusText: order.approvalStatusText,
        approvalStatusState: order.approvalStatusState,
        processInstanceId: order.processInstanceId || null,
        processModelId: order.processModelId || null,
        processModelName: order.processModelName || null,
        createdBy: order.createdBy || null,
        creatorRole: order.creatorRole || null,
        submittedBy: order.submittedBy || null,
        submittedAt: toDate(order.submittedAt),
        currentApprover: order.currentApprover || null,
        currentApproverRole: order.currentApproverRole || null,
        approvedBy: order.approvedBy || null,
        approvedAt: toDate(order.approvedAt),
      },
    });

    for (const item of order.items) {
      await prisma.purchaseOrderItem.upsert({
        where: { id: `${order.id}-${item.lineId}` },
        update: {
          purchaseOrderId: order.id,
          lineId: item.lineId,
          materialId: item.materialId,
          quantity: item.quantity,
        },
        create: {
          id: `${order.id}-${item.lineId}`,
          purchaseOrderId: order.id,
          lineId: item.lineId,
          materialId: item.materialId,
          quantity: item.quantity,
        },
      });
    }
  }

  for (const plan of mockDeliveryPlans) {
    await prisma.deliveryPlan.upsert({
      where: { id: plan.id },
      update: {
        planDate: toDate(plan.planDate)!,
        status: plan.status,
        purchaseOrderId: plan.purchaseOrderId,
        itemCount: plan.itemCount,
        totalQuantity: plan.totalQuantity,
      },
      create: {
        id: plan.id,
        planDate: toDate(plan.planDate)!,
        status: plan.status,
        purchaseOrderId: plan.purchaseOrderId,
        itemCount: plan.itemCount,
        totalQuantity: plan.totalQuantity,
      },
    });

    for (const item of plan.items) {
      await prisma.deliveryPlanItem.upsert({
        where: { id: `${plan.id}-${item.lineId}` },
        update: {
          deliveryPlanId: plan.id,
          lineId: item.lineId,
          purchaseOrderId: item.purchaseOrderId,
          quantity: item.quantity,
        },
        create: {
          id: `${plan.id}-${item.lineId}`,
          deliveryPlanId: plan.id,
          lineId: item.lineId,
          purchaseOrderId: item.purchaseOrderId,
          quantity: item.quantity,
        },
      });
    }
  }

  for (const invoice of mockInvoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {
        invoiceDate: toDate(invoice.invoiceDate)!,
        amount: invoice.amount,
        status: invoice.status,
        purchaseOrderId: invoice.purchaseOrderId,
        deliveryPlanId: invoice.deliveryPlanId,
        itemCount: invoice.itemCount,
      },
      create: {
        id: invoice.id,
        invoiceDate: toDate(invoice.invoiceDate)!,
        amount: invoice.amount,
        status: invoice.status,
        purchaseOrderId: invoice.purchaseOrderId,
        deliveryPlanId: invoice.deliveryPlanId,
        itemCount: invoice.itemCount,
      },
    });

    for (const item of invoice.items) {
      await prisma.invoiceItem.upsert({
        where: { id: `${invoice.id}-${item.lineId}` },
        update: {
          invoiceId: invoice.id,
          lineId: item.lineId,
          purchaseOrderId: item.purchaseOrderId,
          deliveryPlanId: item.deliveryPlanId,
          amount: item.amount,
        },
        create: {
          id: `${invoice.id}-${item.lineId}`,
          invoiceId: invoice.id,
          lineId: item.lineId,
          purchaseOrderId: item.purchaseOrderId,
          deliveryPlanId: item.deliveryPlanId,
          amount: item.amount,
        },
      });
    }
  }

  // Message Center test data
  let demoDataSource = await prisma.dataSource.findUnique({
    where: { name: 'purchase-db-local' },
  });

  if (!demoDataSource) {
    demoDataSource = await prisma.dataSource.upsert({
      where: { name: '演示采购库(PostgreSQL)' },
      update: {
        type: 'POSTGRESQL',
        host: '127.0.0.1',
        port: 5432,
        database: 'purchase_db',
        username: 'purchase',
        password: 'purchase',
        schema: 'public',
        description: '本地演示数据库连接',
        status: 'ACTIVE',
      },
      create: {
        name: '演示采购库(PostgreSQL)',
        type: 'POSTGRESQL',
        host: '127.0.0.1',
        port: 5432,
        database: 'purchase_db',
        username: 'purchase',
        password: 'purchase',
        schema: 'public',
        description: '本地演示数据库连接',
        status: 'ACTIVE',
      },
    });
  }

  const queryTemplateName = '供应商待审批统计';
  const existingTemplate = await prisma.queryTemplate.findFirst({
    where: {
      name: queryTemplateName,
      dataSourceId: demoDataSource.id,
    },
    select: { id: true },
  });

  const queryTemplate = existingTemplate
    ? await prisma.queryTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          sql: "SELECT status, COUNT(*) AS total_count FROM \"Supplier\" GROUP BY status ORDER BY status",
          columnsJson: JSON.stringify([
            { field: 'status', label: '状态', width: '120px' },
            { field: 'total_count', label: '数量', width: '120px' },
          ]),
          description: '统计各状态供应商数量',
          status: 'ACTIVE',
        },
      })
    : await prisma.queryTemplate.create({
        data: {
          name: queryTemplateName,
          dataSourceId: demoDataSource.id,
          sql: "SELECT status, COUNT(*) AS total_count FROM \"Supplier\" GROUP BY status ORDER BY status",
          columnsJson: JSON.stringify([
            { field: 'status', label: '状态', width: '120px' },
            { field: 'total_count', label: '数量', width: '120px' },
          ]),
          description: '统计各状态供应商数量',
          status: 'ACTIVE',
        },
      });

  const notifyChannel = await prisma.notifyChannel.upsert({
    where: { name: '演示钉钉机器人' },
    update: {
      type: 'DINGTALK',
      configJson: JSON.stringify({
        webhook: 'https://oapi.dingtalk.com/robot/send?access_token=REPLACE_ME',
      }),
      description: '请替换为真实 webhook 后测试发送',
      status: 'ACTIVE',
    },
    create: {
      name: '演示钉钉机器人',
      type: 'DINGTALK',
      configJson: JSON.stringify({
        webhook: 'https://oapi.dingtalk.com/robot/send?access_token=REPLACE_ME',
      }),
      description: '请替换为真实 webhook 后测试发送',
      status: 'ACTIVE',
    },
  });

  await prisma.notifyChannel.upsert({
    where: { name: '演示邮件通道' },
    update: {
      type: 'EMAIL',
      configJson: JSON.stringify({
        smtp: {
          host: 'smtp.example.com',
          port: 465,
          secure: true,
          user: 'sender@example.com',
          pass: 'please_replace_password',
          from: '消息中心 <sender@example.com>',
        },
        defaultRecipients: ['receiver1@example.com', 'receiver2@example.com'],
      }),
      description: '请替换真实 SMTP 与收件人后测试发送',
      status: 'ACTIVE',
    },
    create: {
      name: '演示邮件通道',
      type: 'EMAIL',
      configJson: JSON.stringify({
        smtp: {
          host: 'smtp.example.com',
          port: 465,
          secure: true,
          user: 'sender@example.com',
          pass: 'please_replace_password',
          from: '消息中心 <sender@example.com>',
        },
        defaultRecipients: ['receiver1@example.com', 'receiver2@example.com'],
      }),
      description: '请替换真实 SMTP 与收件人后测试发送',
      status: 'ACTIVE',
    },
  });

  const activeTask = await prisma.scheduledTask.upsert({
    where: { name: '工作日早八点推送-供应商统计' },
    update: {
      cronExpr: '0 8 * * 1-5',
      queryTemplateId: queryTemplate.id,
      channelId: notifyChannel.id,
      recipients: '',
      messageTitle: '供应商状态日报',
      status: 'ACTIVE',
      nextRunAt: null,
    },
    create: {
      name: '工作日早八点推送-供应商统计',
      cronExpr: '0 8 * * 1-5',
      queryTemplateId: queryTemplate.id,
      channelId: notifyChannel.id,
      recipients: '',
      messageTitle: '供应商状态日报',
      status: 'ACTIVE',
      nextRunAt: null,
    },
  });

  const pausedTask = await prisma.scheduledTask.upsert({
    where: { name: '每小时巡检-供应商统计(暂停)' },
    update: {
      cronExpr: '0 * * * *',
      queryTemplateId: queryTemplate.id,
      channelId: notifyChannel.id,
      recipients: '',
      messageTitle: '供应商状态巡检',
      status: 'PAUSED',
      nextRunAt: null,
    },
    create: {
      name: '每小时巡检-供应商统计(暂停)',
      cronExpr: '0 * * * *',
      queryTemplateId: queryTemplate.id,
      channelId: notifyChannel.id,
      recipients: '',
      messageTitle: '供应商状态巡检',
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

  await prisma.scheduledTask.update({
    where: { id: activeTask.id },
    data: {
      lastRunAt: new Date(now.getTime() - 60 * 60 * 1000),
      lastRunStatus: 'SUCCESS',
    },
  });

  await prisma.scheduledTask.update({
    where: { id: pausedTask.id },
    data: {
      lastRunAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      lastRunStatus: 'FAILED',
    },
  });

  console.log('Seeded base admin user:', admin);
  console.log('Seeded template data:', {
    roles: mockRoles.length,
    users: mockUsers.length,
    suppliers: mockSuppliers.length,
    materials: mockMaterials.length,
    priceRecords: mockPriceRecords.length,
    purchaseOrders: mockPurchaseOrders.length,
    deliveryPlans: mockDeliveryPlans.length,
    invoices: mockInvoices.length,
    processCategories: mockProcessCategories.length,
    processModels: mockProcessModels.length,
    messageCenter: {
      dataSources: 1,
      queryTemplates: 1,
      notifyChannels: 2,
      tasks: 2,
      taskRunLogs: 2,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

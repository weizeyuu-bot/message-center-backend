import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeBusinessObjectKey(value?: string | null) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '');
  }

  private resolveBusinessAliases(input?: string | null) {
    const raw = String(input || '').trim();
    const key = this.normalizeBusinessObjectKey(raw);
    const aliasMap: Record<string, string[]> = {
      supplier: ['supplier', 'suppliers', '供应商', '供应商管理'],
      material: ['material', 'materials', '物料', '物料管理'],
      purchaseorder: ['purchaseorder', 'purchaseorders', '采购订单', '采购单'],
      deliveryplan: ['deliveryplan', 'deliveryplans', '送货计划'],
      invoice: ['invoice', 'invoices', '发票', '开票'],
    };

    for (const aliases of Object.values(aliasMap)) {
      const normalizedAliases = aliases.map((item) => this.normalizeBusinessObjectKey(item));
      if (normalizedAliases.includes(key)) {
        return new Set(normalizedAliases);
      }
    }

    return new Set([key]);
  }

  private parseSchemaJson(schemaJson?: string | null) {
    if (!schemaJson) {
      return {} as Record<string, unknown>;
    }

    try {
      const parsed = JSON.parse(schemaJson);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private normalizeRoleKey(value?: string | null) {
    return String(value || '')
      .trim()
      .toUpperCase()
      .replace(/[\s_-]/g, '');
  }

  private getRoleAliases(value?: string | null) {
    const raw = String(value || '').trim();
    const key = this.normalizeRoleKey(raw);
    const aliasMap: Record<string, string[]> = {
      ROLEADMIN: ['ROLE_ADMIN', 'ADMIN', '系统管理员'],
      ROLEBUYER: ['ROLE_BUYER', 'USER', '采购专员'],
      ROLEPROCUREMENTMANAGER: ['ROLE_PROCUREMENT_MANAGER', '采购经理'],
      ROLEFINANCE: ['ROLE_FINANCE', '财务专员'],
      ROLEFINANCEMANAGER: ['ROLE_FINANCE_MANAGER', '财务经理'],
    };

    for (const aliases of Object.values(aliasMap)) {
      const normalizedAliases = aliases.map((item) => this.normalizeRoleKey(item));
      if (normalizedAliases.includes(key)) {
        return new Set(normalizedAliases);
      }
    }

    return new Set([key]);
  }

  private isRoleMatched(actualRole?: string | null, expectedRole?: string | null) {
    if (!expectedRole) {
      return true;
    }
    const actualAliases = this.getRoleAliases(actualRole);
    const expectedAliases = this.getRoleAliases(expectedRole);
    for (const alias of actualAliases) {
      if (expectedAliases.has(alias)) {
        return true;
      }
    }
    return false;
  }

  private isAdminRole(role?: string | null) {
    return this.isRoleMatched(role, 'ROLE_ADMIN');
  }

  private assertWorkflowActionAllowed(action: 'submit' | 'approve' | 'reject', binding: any, dto: any) {
    const operatorRole = String(dto?.operatorRole || dto?.role || '');
    if (this.isAdminRole(operatorRole)) {
      return;
    }

    if (action === 'submit') {
      if (!this.isRoleMatched(operatorRole, binding?.initiatorRole)) {
        throw new BadRequestException('当前角色无权提交该审批');
      }
      return;
    }

    if (!this.isRoleMatched(operatorRole, binding?.approverRole)) {
      throw new BadRequestException('当前角色无权执行审批动作');
    }
  }

  private toDate(value?: string | Date | null) {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    const normalized = value.includes(' ') ? value.replace(' ', 'T') : `${value}T00:00:00`;
    return new Date(normalized);
  }

  private toDateString(value?: Date | string | null) {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString().slice(0, 10);
  }

  private toDateTimeString(value?: Date | string | null) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  private getApprovalComment(dto: any) {
    const value = String(dto?.comment || dto?.approvalComment || '').trim();
    return value || null;
  }

  private getApprovalActionText(action?: string | null) {
    switch (action) {
      case 'SUBMIT':
        return '提交审批';
      case 'APPROVE':
        return '审批通过';
      case 'REJECT':
        return '审批驳回';
      default:
        return '审批动作';
    }
  }

  private mapApprovalActionLog(log: any) {
    return {
      id: log.id,
      action: log.action,
      actionText: this.getApprovalActionText(log.action),
      operator: log.operator || '',
      operatorRole: log.operatorRole || '',
      operatorDisplay: [log.operator, log.operatorRole].filter((item) => !!item).join(' / ') || '-',
      comment: log.comment || '',
      statusText: log.statusText || '',
      statusState: log.statusState || 'None',
      createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : String(log.createdAt || ''),
      createdAtText: this.toDateTimeString(log.createdAt),
    };
  }

  private async getApprovalHistory(processInstanceId?: string | null) {
    if (!processInstanceId) {
      return [];
    }

    const logs = await this.prisma.approvalActionLog.findMany({
      where: { processInstanceId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return logs.map((item: any) => this.mapApprovalActionLog(item));
  }

  private async createApprovalActionLog(tx: any, payload: any) {
    return tx.approvalActionLog.create({
      data: {
        processInstanceId: payload.processInstanceId,
        businessObject: payload.businessObject,
        businessId: payload.businessId,
        action: payload.action,
        operator: payload.operator || null,
        operatorRole: payload.operatorRole || null,
        comment: payload.comment || null,
        statusText: payload.statusText || null,
        statusState: payload.statusState || null,
      },
    });
  }

  private async submitWorkflowApproval(
    processInstancePrefix: string,
    businessObject: string,
    businessId: string,
    binding: any,
    dto: any,
  ) {
    const existing = await this.prisma.processInstance.findFirst({
      where: {
        modelId: binding.id,
        businessId,
      },
    });

    const operator = String(dto?.operator || dto?.username || 'system');
    const operatorRole = String(dto?.operatorRole || dto?.role || binding.initiatorRole || '');
    const approver = String(dto?.approver || binding.approverRole || '');
    const comment = this.getApprovalComment(dto);

    return this.prisma.$transaction(async (tx) => {
      const submittedAt = new Date();
      const instance = existing
        ? await tx.processInstance.update({
            where: { id: existing.id },
            data: {
              currentNode: '审批中',
              initiator: operator,
              initiatorRole: operatorRole,
              currentHandler: approver,
              statusText: '审批中',
              statusState: 'Warning',
              submittedAt,
            },
          })
        : await tx.processInstance.create({
            data: {
              id: `${processInstancePrefix}${businessId}`,
              modelId: binding.id,
              businessId,
              currentNode: '审批中',
              initiator: operator,
              initiatorRole: operatorRole,
              currentHandler: approver,
              statusText: '审批中',
              statusState: 'Warning',
              submittedAt,
            },
          });

      await this.createApprovalActionLog(tx, {
        processInstanceId: instance.id,
        businessObject,
        businessId,
        action: 'SUBMIT',
        operator,
        operatorRole,
        comment,
        statusText: '审批中',
        statusState: 'Warning',
      });

      return instance;
    });
  }

  private async completeWorkflowApproval(
    businessObject: string,
    businessId: string,
    binding: any,
    dto: any,
    action: 'APPROVE' | 'REJECT',
    missingMessage: string,
  ) {
    const existing = await this.prisma.processInstance.findFirst({
      where: {
        modelId: binding.id,
        businessId,
      },
    });

    if (!existing) {
      throw new BadRequestException(missingMessage);
    }

    const operator = String(dto?.operator || dto?.username || binding.approverRole || 'system');
    const operatorRole = String(dto?.operatorRole || dto?.role || binding.approverRole || '');
    const comment = this.getApprovalComment(dto);
    const statusText = action === 'APPROVE' ? '已完成' : '已驳回';
    const statusState = action === 'APPROVE' ? 'Success' : 'Error';

    return this.prisma.$transaction(async (tx) => {
      const instance = await tx.processInstance.update({
        where: { id: existing.id },
        data: {
          currentNode: '流程结束',
          currentHandler: operator,
          statusText,
          statusState,
        },
      });

      await this.createApprovalActionLog(tx, {
        processInstanceId: instance.id,
        businessObject,
        businessId,
        action,
        operator,
        operatorRole,
        comment,
        statusText,
        statusState,
      });

      return instance;
    });
  }

  private mapSupplier(supplier: any, processContext?: any) {
    const instance = processContext?.instance;
    const binding = processContext?.binding;
    const workflowEnabled = !!binding;

    let approvalStatus = 'DRAFT';
    let approvalStatusText = '草稿待提交';
    let approvalStatusState = 'Information';

    if (instance) {
      if (instance.statusState === 'Warning') {
        approvalStatus = 'SUBMITTED';
        approvalStatusText = instance.statusText || '审批中';
        approvalStatusState = 'Warning';
      } else if (instance.statusState === 'Success') {
        approvalStatus = 'APPROVED';
        approvalStatusText = instance.statusText || '已完成';
        approvalStatusState = 'Success';
      } else if (instance.statusState === 'Error') {
        approvalStatus = 'REJECTED';
        approvalStatusText = instance.statusText || '已驳回';
        approvalStatusState = 'Error';
      }
    }

    return {
      id: supplier.id,
      name: supplier.name,
      taxNumber: supplier.taxNumber || '',
      address: supplier.address || '',
      contact: supplier.contact || '',
      email: supplier.email || '',
      workflowEnabled,
      processModelId: binding?.id || '',
      processModelName: binding?.name || '',
      processInstanceId: instance?.id || '',
      approvalStatus,
      approvalStatusText,
      approvalStatusState,
      submittedAt: this.toDateTimeString(instance?.submittedAt),
      currentApprover: instance?.currentHandler || binding?.approverRole || '',
      currentApproverRole: binding?.approverRole || '',
      initiatorRole: binding?.initiatorRole || '',
      approvalHistory: Array.isArray(processContext?.history) ? processContext.history : [],
    };
  }

  private async getWorkflowBindingByBusinessObject(businessObject: string) {
    const aliases = this.resolveBusinessAliases(businessObject);
    const models = await this.prisma.processModel.findMany({
      include: { form: true, deployments: true },
      orderBy: { updatedAt: 'desc' },
    });

    const candidates = models
      .map((model) => {
        const schema = this.parseSchemaJson(model.form?.schemaJson);
        const schemaBusinessObject =
          typeof schema.businessObject === 'string' ? String(schema.businessObject) : '';
        const modelBusinessObject = model.businessObject || schemaBusinessObject;
        if (!aliases.has(this.normalizeBusinessObjectKey(modelBusinessObject))) {
          return null;
        }

        const publishedDeployment = (model.deployments || []).find(
          (item) => item.status === 'PUBLISHED',
        );

        return {
          model,
          publishedDeployment,
          initiatorRole:
            model.initiatorRole ||
            (typeof schema.initiatorRole === 'string' ? String(schema.initiatorRole) : '') ||
            model.form?.initiatorRole ||
            '',
          approverRole:
            model.approverRole ||
            (typeof schema.approverRole === 'string' ? String(schema.approverRole) : '') ||
            model.form?.approverRole ||
            '',
        };
      })
      .filter((item) => !!item)
      .sort((a, b) => {
        const aScore = a!.publishedDeployment ? 1 : 0;
        const bScore = b!.publishedDeployment ? 1 : 0;
        return bScore - aScore;
      });

    const matched = candidates[0];
    if (!matched) {
      return null;
    }

    return {
      id: matched.model.id,
      name: matched.model.name,
      initiatorRole: matched.initiatorRole,
      approverRole: matched.approverRole,
      deploymentId: matched.publishedDeployment?.deploymentId || '',
    };
  }

  private async buildSupplierProcessContextMap(supplierIds: string[]) {
    const binding = await this.getWorkflowBindingByBusinessObject('供应商');
    const map = new Map<string, any>();

    if (!binding || !supplierIds.length) {
      return { binding, map };
    }

    const instances = await this.prisma.processInstance.findMany({
      where: {
        modelId: binding.id,
        businessId: { in: supplierIds },
      },
    });
    instances.forEach((instance) => {
      map.set(instance.businessId, instance);
    });

    return { binding, map };
  }

  private async buildMaterialProcessContextMap(materialIds: string[]) {
    const binding = await this.getWorkflowBindingByBusinessObject('物料');
    const map = new Map<string, any>();

    if (!binding || !materialIds.length) {
      return { binding, map };
    }

    const instances = await this.prisma.processInstance.findMany({
      where: {
        modelId: binding.id,
        businessId: { in: materialIds },
      },
    });
    instances.forEach((instance) => {
      map.set(instance.businessId, instance);
    });

    return { binding, map };
  }

  private async buildDeliveryPlanProcessContextMap(planIds: string[]) {
    const binding = await this.getWorkflowBindingByBusinessObject('送货计划');
    const map = new Map<string, any>();

    if (!binding || !planIds.length) {
      return { binding, map };
    }

    const instances = await this.prisma.processInstance.findMany({
      where: {
        modelId: binding.id,
        businessId: { in: planIds },
      },
    });
    instances.forEach((instance) => {
      map.set(instance.businessId, instance);
    });

    return { binding, map };
  }

  private async buildInvoiceProcessContextMap(invoiceIds: string[]) {
    const binding = await this.getWorkflowBindingByBusinessObject('发票');
    const map = new Map<string, any>();

    if (!binding || !invoiceIds.length) {
      return { binding, map };
    }

    const instances = await this.prisma.processInstance.findMany({
      where: {
        modelId: binding.id,
        businessId: { in: invoiceIds },
      },
    });
    instances.forEach((instance) => {
      map.set(instance.businessId, instance);
    });

    return { binding, map };
  }

  private async buildPurchaseOrderProcessContextMap(orderIds: string[]) {
    const binding = await this.getWorkflowBindingByBusinessObject('采购订单');
    const map = new Map<string, any>();

    if (!binding || !orderIds.length) {
      return { binding, map };
    }

    const instances = await this.prisma.processInstance.findMany({
      where: {
        modelId: binding.id,
        businessId: { in: orderIds },
      },
    });
    instances.forEach((instance) => {
      map.set(instance.businessId, instance);
    });

    return { binding, map };
  }

  private mapMaterial(material: any, processContext?: any) {
    const instance = processContext?.instance;
    const binding = processContext?.binding;
    const workflowEnabled = !!binding;

    let approvalStatus = 'DRAFT';
    let approvalStatusText = '草稿待提交';
    let approvalStatusState = 'Information';

    if (instance) {
      if (instance.statusState === 'Warning') {
        approvalStatus = 'SUBMITTED';
        approvalStatusText = instance.statusText || '审批中';
        approvalStatusState = 'Warning';
      } else if (instance.statusState === 'Success') {
        approvalStatus = 'APPROVED';
        approvalStatusText = instance.statusText || '已完成';
        approvalStatusState = 'Success';
      } else if (instance.statusState === 'Error') {
        approvalStatus = 'REJECTED';
        approvalStatusText = instance.statusText || '已驳回';
        approvalStatusState = 'Error';
      }
    }

    return {
      id: material.id,
      name: material.name,
      spec: material.spec || '',
      unit: material.unit || '',
      stock: material.stock || 0,
      workflowEnabled,
      processModelId: binding?.id || '',
      processModelName: binding?.name || '',
      processInstanceId: instance?.id || '',
      approvalStatus,
      approvalStatusText,
      approvalStatusState,
      submittedAt: this.toDateTimeString(instance?.submittedAt),
      currentApprover: instance?.currentHandler || binding?.approverRole || '',
      currentApproverRole: binding?.approverRole || '',
      initiatorRole: binding?.initiatorRole || '',
      approvalHistory: Array.isArray(processContext?.history) ? processContext.history : [],
    };
  }

  private mapPriceRecord(record: any) {
    return {
      id: record.id,
      supplierId: record.supplierId,
      supplierName: record.supplier?.name || '',
      materialId: record.materialId,
      materialName: record.material?.name || '',
      unit: record.unit || record.material?.unit || '',
      validFrom: this.toDateString(record.validFrom),
      validTo: this.toDateString(record.validTo),
      unitPrice: Number(record.unitPrice || 0),
      currency: record.currency || 'CNY',
      taxRate: record.taxRate || 0,
      remark: record.remark || '',
    };
  }

  private mapPurchaseOrder(order: any, processContext?: any) {
    const instance = processContext?.instance;
    const binding = processContext?.binding;
    const workflowEnabled = !!binding;

    // Derive approval status: ProcessInstance is authoritative; fall back to in-table fields
    let approvalStatus = order.approvalStatus || 'DRAFT';
    let approvalStatusText = order.approvalStatusText || '草稿待提交';
    let approvalStatusState = order.approvalStatusState || 'Information';

    if (instance) {
      if (instance.statusState === 'Warning') {
        approvalStatus = 'SUBMITTED';
        approvalStatusText = instance.statusText || '审批中';
        approvalStatusState = 'Warning';
      } else if (instance.statusState === 'Success') {
        approvalStatus = 'APPROVED';
        approvalStatusText = instance.statusText || '已完成';
        approvalStatusState = 'Success';
      } else if (instance.statusState === 'Error') {
        approvalStatus = 'REJECTED';
        approvalStatusText = instance.statusText || '已驳回';
        approvalStatusState = 'Error';
      }
    }

    const items = (order.items || []).map((item: any) => ({
      lineId: item.lineId,
      materialId: item.materialId,
      materialName: item.material?.name || '',
      quantity: Number(item.quantity || 0),
      unit: item.material?.unit || '',
      unitPrice: 0,
      currency: 'CNY',
      amount: '0.00',
      priceRecordId: '',
      priceValidFrom: '',
      priceValidTo: '',
      priceMatched: false,
      priceStatusText: 'MISSING',
      priceStatusState: 'Error',
      lowestPriceRecordId: '',
      lowestMarketPrice: '0.00',
      lowestMarketSupplierName: '',
      priceBenchmarkText: '暂无可比价格',
      priceBenchmarkState: 'None',
    }));
    const totalQuantity = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

    return {
      id: order.id,
      supplierId: order.supplierId,
      vendor: order.supplier?.name || '',
      date: this.toDateString(order.orderDate),
      status: order.status,
      approvalStatus,
      approvalStatusText,
      approvalStatusState,
      workflowEnabled,
      processModelId: binding?.id || order.processModelId || '',
      processModelName: binding?.name || order.processModelName || '',
      processInstanceId: instance?.id || order.processInstanceId || '',
      createdBy: order.createdBy || '',
      creatorRole: order.creatorRole || '',
      submittedBy: instance?.initiator || order.submittedBy || '',
      submittedAt: this.toDateTimeString(instance?.submittedAt || order.submittedAt),
      currentApprover: instance?.currentHandler || order.currentApprover || '',
      currentApproverRole: binding?.approverRole || order.currentApproverRole || '',
      initiatorRole: binding?.initiatorRole || order.creatorRole || '',
      approvedBy: order.approvedBy || '',
      approvedAt: this.toDateTimeString(order.approvedAt),
      approvalHistory: Array.isArray(processContext?.history) ? processContext.history : [],
      itemCount: items.length,
      totalQuantity,
      amount: '0.00',
      currency: 'CNY',
      items,
    };
  }

  private mapDeliveryPlan(plan: any, processContext?: any) {
    const instance = processContext?.instance;
    const binding = processContext?.binding;
    const workflowEnabled = !!binding;

    let approvalStatus = 'DRAFT';
    let approvalStatusText = '草稿待提交';
    let approvalStatusState = 'Information';

    if (instance) {
      if (instance.statusState === 'Warning') {
        approvalStatus = 'SUBMITTED';
        approvalStatusText = instance.statusText || '审批中';
        approvalStatusState = 'Warning';
      } else if (instance.statusState === 'Success') {
        approvalStatus = 'APPROVED';
        approvalStatusText = instance.statusText || '已完成';
        approvalStatusState = 'Success';
      } else if (instance.statusState === 'Error') {
        approvalStatus = 'REJECTED';
        approvalStatusText = instance.statusText || '已驳回';
        approvalStatusState = 'Error';
      }
    }

    const items = (plan.items || []).map((item: any) => ({
      lineId: item.lineId,
      purchaseOrderId: item.purchaseOrderId,
      quantity: Number(item.quantity || 0),
    }));

    return {
      id: plan.id,
      date: this.toDateString(plan.planDate),
      status: plan.status,
      purchaseOrderId: plan.purchaseOrderId,
      itemCount: plan.itemCount,
      totalQuantity: Number(plan.totalQuantity || 0),
      items,
      workflowEnabled,
      processModelId: binding?.id || '',
      processModelName: binding?.name || '',
      processInstanceId: instance?.id || '',
      approvalStatus,
      approvalStatusText,
      approvalStatusState,
      submittedAt: this.toDateTimeString(instance?.submittedAt),
      currentApprover: instance?.currentHandler || binding?.approverRole || '',
      currentApproverRole: binding?.approverRole || '',
      initiatorRole: binding?.initiatorRole || '',
      approvalHistory: Array.isArray(processContext?.history) ? processContext.history : [],
    };
  }

  private mapInvoice(invoice: any, processContext?: any) {
    const instance = processContext?.instance;
    const binding = processContext?.binding;
    const workflowEnabled = !!binding;

    let approvalStatus = 'DRAFT';
    let approvalStatusText = '草稿待提交';
    let approvalStatusState = 'Information';

    if (instance) {
      if (instance.statusState === 'Warning') {
        approvalStatus = 'SUBMITTED';
        approvalStatusText = instance.statusText || '审批中';
        approvalStatusState = 'Warning';
      } else if (instance.statusState === 'Success') {
        approvalStatus = 'APPROVED';
        approvalStatusText = instance.statusText || '已完成';
        approvalStatusState = 'Success';
      } else if (instance.statusState === 'Error') {
        approvalStatus = 'REJECTED';
        approvalStatusText = instance.statusText || '已驳回';
        approvalStatusState = 'Error';
      }
    }

    const items = (invoice.items || []).map((item: any) => ({
      lineId: item.lineId,
      purchaseOrderId: item.purchaseOrderId,
      deliveryPlanId: item.deliveryPlanId,
      amount: Number(item.amount || 0),
    }));

    return {
      id: invoice.id,
      date: this.toDateString(invoice.invoiceDate),
      amount: Number(invoice.amount || 0).toFixed(2),
      status: invoice.status,
      purchaseOrderId: invoice.purchaseOrderId,
      deliveryPlanId: invoice.deliveryPlanId,
      itemCount: invoice.itemCount,
      items,
      workflowEnabled,
      processModelId: binding?.id || '',
      processModelName: binding?.name || '',
      processInstanceId: instance?.id || '',
      approvalStatus,
      approvalStatusText,
      approvalStatusState,
      submittedAt: this.toDateTimeString(instance?.submittedAt),
      currentApprover: instance?.currentHandler || binding?.approverRole || '',
      currentApproverRole: binding?.approverRole || '',
      initiatorRole: binding?.initiatorRole || '',
      approvalHistory: Array.isArray(processContext?.history) ? processContext.history : [],
    };
  }

  private buildPurchaseOrderData(dto: any, idOverride?: string) {
    const id = idOverride || dto.id;
    const items = (dto.items || []).map((item: any, index: number) => ({
      id: `${id}-${item.lineId || String((index + 1) * 10)}`,
      lineId: item.lineId || String((index + 1) * 10),
      materialId: item.materialId,
      quantity: Number(item.quantity || 0),
    }));

    return {
      id,
      supplierId: dto.supplierId,
      orderDate: this.toDate(dto.date),
      status: dto.status,
      createdBy: dto.createdBy || null,
      creatorRole: dto.creatorRole || null,
      items,
    };
  }

  private buildDeliveryPlanData(dto: any, idOverride?: string) {
    const id = idOverride || dto.id;
    const items = (dto.items || []).map((item: any, index: number) => ({
      id: `${id}-${item.lineId || String((index + 1) * 10)}`,
      lineId: item.lineId || String((index + 1) * 10),
      purchaseOrderId: item.purchaseOrderId,
      quantity: Number(item.quantity || 0),
    }));

    return {
      id,
      planDate: this.toDate(dto.date),
      status: dto.status,
      purchaseOrderId: dto.purchaseOrderId || items[0]?.purchaseOrderId,
      itemCount: items.length,
      totalQuantity: items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0),
      items,
    };
  }

  private buildInvoiceData(dto: any, idOverride?: string) {
    const id = idOverride || dto.id;
    const items = (dto.items || []).map((item: any, index: number) => ({
      id: `${id}-${item.lineId || String((index + 1) * 10)}`,
      lineId: item.lineId || String((index + 1) * 10),
      purchaseOrderId: item.purchaseOrderId,
      deliveryPlanId: item.deliveryPlanId,
      amount: Number(item.amount || 0),
    }));

    return {
      id,
      invoiceDate: this.toDate(dto.date),
      amount: items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0),
      status: dto.status,
      purchaseOrderId: dto.purchaseOrderId || items[0]?.purchaseOrderId,
      deliveryPlanId: dto.deliveryPlanId || items[0]?.deliveryPlanId,
      itemCount: items.length,
      items,
    };
  }

  async listSuppliers() {
    const suppliers = await this.prisma.supplier.findMany({ orderBy: { id: 'asc' } });
    const { binding, map } = await this.buildSupplierProcessContextMap(
      suppliers.map((item) => item.id),
    );
    return suppliers.map((item) =>
      this.mapSupplier(item, {
        binding,
        instance: map.get(item.id),
      }),
    );
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }
    const { binding, map } = await this.buildSupplierProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async createSupplier(dto: any) {
    const supplier = await this.prisma.supplier.create({ data: dto });
    const { binding, map } = await this.buildSupplierProcessContextMap([supplier.id]);
    const instance = map.get(supplier.id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async updateSupplier(id: string, dto: any) {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name,
        taxNumber: dto.taxNumber,
        address: dto.address,
        contact: dto.contact,
        email: dto.email,
      },
    });
    const { binding, map } = await this.buildSupplierProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async submitSupplierApproval(id: string, dto: any) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('供应商');
    if (!binding) {
      throw new BadRequestException('未配置可用的供应商审批流程');
    }
    this.assertWorkflowActionAllowed('submit', binding, dto);

    const instance = await this.submitWorkflowApproval('PI-SUP-', '供应商', id, binding, dto);
    const history = await this.getApprovalHistory(instance.id);

    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async approveSupplierApproval(id: string, dto: any) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('供应商');
    if (!binding) {
      throw new BadRequestException('未配置可用的供应商审批流程');
    }
    this.assertWorkflowActionAllowed('approve', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '供应商',
      id,
      binding,
      dto,
      'APPROVE',
      '当前供应商尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async rejectSupplierApproval(id: string, dto: any) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('供应商');
    if (!binding) {
      throw new BadRequestException('未配置可用的供应商审批流程');
    }
    this.assertWorkflowActionAllowed('reject', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '供应商',
      id,
      binding,
      dto,
      'REJECT',
      '当前供应商尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapSupplier(supplier, {
      binding,
      instance,
      history,
    });
  }

  async deleteSupplier(id: string) {
    await this.prisma.supplier.delete({ where: { id } });
    return { success: true };
  }

  async listMaterials() {
    const materials = await this.prisma.material.findMany({ orderBy: { id: 'asc' } });
    const { binding, map } = await this.buildMaterialProcessContextMap(
      materials.map((item) => item.id),
    );
    return materials.map((item) =>
      this.mapMaterial(item, {
        binding,
        instance: map.get(item.id),
      }),
    );
  }

  async getMaterial(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException('物料不存在');
    }
    const { binding, map } = await this.buildMaterialProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async createMaterial(dto: any) {
    const material = await this.prisma.material.create({
      data: { ...dto, stock: Number(dto.stock || 0) },
    });
    const { binding, map } = await this.buildMaterialProcessContextMap([material.id]);
    const instance = map.get(material.id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async updateMaterial(id: string, dto: any) {
    const material = await this.prisma.material.update({
      where: { id },
      data: {
        name: dto.name,
        spec: dto.spec,
        unit: dto.unit,
        stock: Number(dto.stock || 0),
      },
    });
    const { binding, map } = await this.buildMaterialProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async submitMaterialApproval(id: string, dto: any) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException('物料不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('物料');
    if (!binding) {
      throw new BadRequestException('未配置可用的物料审批流程');
    }
    this.assertWorkflowActionAllowed('submit', binding, dto);

    const instance = await this.submitWorkflowApproval('PI-MAT-', '物料', id, binding, dto);
    const history = await this.getApprovalHistory(instance.id);

    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async approveMaterialApproval(id: string, dto: any) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException('物料不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('物料');
    if (!binding) {
      throw new BadRequestException('未配置可用的物料审批流程');
    }
    this.assertWorkflowActionAllowed('approve', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '物料',
      id,
      binding,
      dto,
      'APPROVE',
      '当前物料尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async rejectMaterialApproval(id: string, dto: any) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException('物料不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('物料');
    if (!binding) {
      throw new BadRequestException('未配置可用的物料审批流程');
    }
    this.assertWorkflowActionAllowed('reject', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '物料',
      id,
      binding,
      dto,
      'REJECT',
      '当前物料尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapMaterial(material, {
      binding,
      instance,
      history,
    });
  }

  async deleteMaterial(id: string) {
    await this.prisma.material.delete({ where: { id } });
    return { success: true };
  }

  async listPriceRecords() {
    const records = await this.prisma.priceRecord.findMany({
      include: { supplier: true, material: true },
      orderBy: { id: 'asc' },
    });
    return records.map((item) => this.mapPriceRecord(item));
  }

  async getPriceRecord(id: string) {
    const record = await this.prisma.priceRecord.findUnique({
      where: { id },
      include: { supplier: true, material: true },
    });
    if (!record) {
      throw new NotFoundException('价格记录不存在');
    }
    return this.mapPriceRecord(record);
  }

  async createPriceRecord(dto: any) {
    const record = await this.prisma.priceRecord.create({
      data: {
        id: dto.id,
        supplierId: dto.supplierId,
        materialId: dto.materialId,
        unit: dto.unit,
        validFrom: this.toDate(dto.validFrom)!,
        validTo: this.toDate(dto.validTo)!,
        unitPrice: Number(dto.unitPrice || 0),
        currency: dto.currency || 'CNY',
        taxRate: Number(dto.taxRate || 0),
        remark: dto.remark,
      },
      include: { supplier: true, material: true },
    });
    return this.mapPriceRecord(record);
  }

  async updatePriceRecord(id: string, dto: any) {
    const record = await this.prisma.priceRecord.update({
      where: { id },
      data: {
        supplierId: dto.supplierId,
        materialId: dto.materialId,
        unit: dto.unit,
        validFrom: this.toDate(dto.validFrom),
        validTo: this.toDate(dto.validTo),
        unitPrice: Number(dto.unitPrice || 0),
        currency: dto.currency || 'CNY',
        taxRate: Number(dto.taxRate || 0),
        remark: dto.remark,
      },
      include: { supplier: true, material: true },
    });
    return this.mapPriceRecord(record);
  }

  async deletePriceRecord(id: string) {
    await this.prisma.priceRecord.delete({ where: { id } });
    return { success: true };
  }

  async listPurchaseOrders() {
    const orders = await this.prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { material: true } } },
      orderBy: { id: 'asc' },
    });
    const { binding, map } = await this.buildPurchaseOrderProcessContextMap(
      orders.map((item) => item.id),
    );
    return orders.map((item) =>
      this.mapPurchaseOrder(item, {
        binding,
        instance: map.get(item.id),
      }),
    );
  }

  async getPurchaseOrder(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { material: true } } },
    });
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }
    const { binding, map } = await this.buildPurchaseOrderProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapPurchaseOrder(order, { binding, instance, history });
  }

  async createPurchaseOrder(dto: any) {
    const data = this.buildPurchaseOrderData(dto);
    const order = await this.prisma.purchaseOrder.create({
      data: {
        id: data.id,
        supplierId: data.supplierId,
        orderDate: data.orderDate!,
        status: data.status,
        approvalStatus: 'DRAFT',
        approvalStatusText: '草稿待提交',
        approvalStatusState: 'Information',
        createdBy: data.createdBy,
        creatorRole: data.creatorRole,
        items: {
          create: data.items,
        },
      },
      include: { supplier: true, items: { include: { material: true } } },
    });
    const { binding } = await this.buildPurchaseOrderProcessContextMap([order.id]);
    return this.mapPurchaseOrder(order, { binding });
  }

  async updatePurchaseOrder(id: string, dto: any) {
    const data = this.buildPurchaseOrderData(dto, id);
    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: data.supplierId,
        orderDate: data.orderDate,
        status: data.status,
        items: {
          deleteMany: {},
          create: data.items,
        },
      },
      include: { supplier: true, items: { include: { material: true } } },
    });
    const { binding, map } = await this.buildPurchaseOrderProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapPurchaseOrder(order, { binding, instance, history });
  }

  async deletePurchaseOrder(id: string) {
    await this.prisma.invoiceItem.deleteMany({ where: { purchaseOrderId: id } });
    await this.prisma.invoice.deleteMany({ where: { purchaseOrderId: id } });
    await this.prisma.deliveryPlanItem.deleteMany({ where: { purchaseOrderId: id } });
    await this.prisma.deliveryPlan.deleteMany({ where: { purchaseOrderId: id } });
    await this.prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await this.prisma.purchaseOrder.delete({ where: { id } });
    return { success: true };
  }

  async listDeliveryPlans() {
    const plans = await this.prisma.deliveryPlan.findMany({
      include: { items: true },
      orderBy: { id: 'asc' },
    });
    const { binding, map } = await this.buildDeliveryPlanProcessContextMap(
      plans.map((item) => item.id),
    );
    return plans.map((item) =>
      this.mapDeliveryPlan(item, {
        binding,
        instance: map.get(item.id),
      }),
    );
  }

  async getDeliveryPlan(id: string) {
    const plan = await this.prisma.deliveryPlan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!plan) {
      throw new NotFoundException('送货计划不存在');
    }
    const { binding, map } = await this.buildDeliveryPlanProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapDeliveryPlan(plan, {
      binding,
      instance,
      history,
    });
  }

  async createDeliveryPlan(dto: any) {
    const data = this.buildDeliveryPlanData(dto);
    const plan = await this.prisma.deliveryPlan.create({
      data: {
        id: data.id,
        planDate: data.planDate!,
        status: data.status,
        purchaseOrderId: data.purchaseOrderId,
        itemCount: data.itemCount,
        totalQuantity: data.totalQuantity,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
    const { binding, map } = await this.buildDeliveryPlanProcessContextMap([plan.id]);
    const instance = map.get(plan.id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapDeliveryPlan(plan, {
      binding,
      instance,
      history,
    });
  }

  async updateDeliveryPlan(id: string, dto: any) {
    const data = this.buildDeliveryPlanData(dto, id);
    const plan = await this.prisma.deliveryPlan.update({
      where: { id },
      data: {
        planDate: data.planDate,
        status: data.status,
        purchaseOrderId: data.purchaseOrderId,
        itemCount: data.itemCount,
        totalQuantity: data.totalQuantity,
        items: {
          deleteMany: {},
          create: data.items,
        },
      },
      include: { items: true },
    });
    const { binding, map } = await this.buildDeliveryPlanProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapDeliveryPlan(plan, {
      binding,
      instance,
      history,
    });
  }

  async submitDeliveryPlanApproval(id: string, dto: any) {
    const plan = await this.prisma.deliveryPlan.findUnique({ where: { id }, include: { items: true } });
    if (!plan) {
      throw new NotFoundException('送货计划不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('送货计划');
    if (!binding) {
      throw new BadRequestException('未配置可用的送货计划审批流程');
    }
    this.assertWorkflowActionAllowed('submit', binding, dto);

    const instance = await this.submitWorkflowApproval('PI-DP-', '送货计划', id, binding, dto);
    const history = await this.getApprovalHistory(instance.id);

    return this.mapDeliveryPlan(plan, { binding, instance, history });
  }

  async approveDeliveryPlanApproval(id: string, dto: any) {
    const plan = await this.prisma.deliveryPlan.findUnique({ where: { id }, include: { items: true } });
    if (!plan) {
      throw new NotFoundException('送货计划不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('送货计划');
    if (!binding) {
      throw new BadRequestException('未配置可用的送货计划审批流程');
    }
    this.assertWorkflowActionAllowed('approve', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '送货计划',
      id,
      binding,
      dto,
      'APPROVE',
      '当前送货计划尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapDeliveryPlan(plan, { binding, instance, history });
  }

  async rejectDeliveryPlanApproval(id: string, dto: any) {
    const plan = await this.prisma.deliveryPlan.findUnique({ where: { id }, include: { items: true } });
    if (!plan) {
      throw new NotFoundException('送货计划不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('送货计划');
    if (!binding) {
      throw new BadRequestException('未配置可用的送货计划审批流程');
    }
    this.assertWorkflowActionAllowed('reject', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '送货计划',
      id,
      binding,
      dto,
      'REJECT',
      '当前送货计划尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapDeliveryPlan(plan, { binding, instance, history });
  }

  async deleteDeliveryPlan(id: string) {
    await this.prisma.invoiceItem.deleteMany({ where: { deliveryPlanId: id } });
    await this.prisma.invoice.deleteMany({ where: { deliveryPlanId: id } });
    await this.prisma.deliveryPlanItem.deleteMany({ where: { deliveryPlanId: id } });
    await this.prisma.deliveryPlan.delete({ where: { id } });
    return { success: true };
  }

  async listInvoices() {
    const invoices = await this.prisma.invoice.findMany({
      include: { items: true },
      orderBy: { id: 'asc' },
    });
    const { binding, map } = await this.buildInvoiceProcessContextMap(
      invoices.map((item) => item.id),
    );
    return invoices.map((item) =>
      this.mapInvoice(item, {
        binding,
        instance: map.get(item.id),
      }),
    );
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) {
      throw new NotFoundException('发票不存在');
    }
    const { binding, map } = await this.buildInvoiceProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapInvoice(invoice, {
      binding,
      instance,
      history,
    });
  }

  async createInvoice(dto: any) {
    const data = this.buildInvoiceData(dto);
    const invoice = await this.prisma.invoice.create({
      data: {
        id: data.id,
        invoiceDate: data.invoiceDate!,
        amount: data.amount,
        status: data.status,
        purchaseOrderId: data.purchaseOrderId,
        deliveryPlanId: data.deliveryPlanId,
        itemCount: data.itemCount,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
    const { binding, map } = await this.buildInvoiceProcessContextMap([invoice.id]);
    const instance = map.get(invoice.id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapInvoice(invoice, {
      binding,
      instance,
      history,
    });
  }

  async updateInvoice(id: string, dto: any) {
    const data = this.buildInvoiceData(dto, id);
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        invoiceDate: data.invoiceDate,
        amount: data.amount,
        status: data.status,
        purchaseOrderId: data.purchaseOrderId,
        deliveryPlanId: data.deliveryPlanId,
        itemCount: data.itemCount,
        items: {
          deleteMany: {},
          create: data.items,
        },
      },
      include: { items: true },
    });
    const { binding, map } = await this.buildInvoiceProcessContextMap([id]);
    const instance = map.get(id);
    const history = await this.getApprovalHistory(instance?.id);
    return this.mapInvoice(invoice, {
      binding,
      instance,
      history,
    });
  }

  async submitInvoiceApproval(id: string, dto: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    if (!invoice) {
      throw new NotFoundException('发票不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('发票');
    if (!binding) {
      throw new BadRequestException('未配置可用的发票审批流程');
    }
    this.assertWorkflowActionAllowed('submit', binding, dto);

    const instance = await this.submitWorkflowApproval('PI-INV-', '发票', id, binding, dto);
    const history = await this.getApprovalHistory(instance.id);

    return this.mapInvoice(invoice, { binding, instance, history });
  }

  async approveInvoiceApproval(id: string, dto: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    if (!invoice) {
      throw new NotFoundException('发票不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('发票');
    if (!binding) {
      throw new BadRequestException('未配置可用的发票审批流程');
    }
    this.assertWorkflowActionAllowed('approve', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '发票',
      id,
      binding,
      dto,
      'APPROVE',
      '当前发票尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapInvoice(invoice, { binding, instance, history });
  }

  async rejectInvoiceApproval(id: string, dto: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    if (!invoice) {
      throw new NotFoundException('发票不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('发票');
    if (!binding) {
      throw new BadRequestException('未配置可用的发票审批流程');
    }
    this.assertWorkflowActionAllowed('reject', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '发票',
      id,
      binding,
      dto,
      'REJECT',
      '当前发票尚未提交审批',
    );
    const history = await this.getApprovalHistory(instance.id);

    return this.mapInvoice(invoice, { binding, instance, history });
  }

  async deleteInvoice(id: string) {
    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await this.prisma.invoice.delete({ where: { id } });
    return { success: true };
  }

  async submitPurchaseOrderApproval(id: string, dto: any) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { material: true } } },
    });
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('采购订单');
    if (!binding) {
      throw new BadRequestException('未配置可用的采购订单审批流程');
    }
    this.assertWorkflowActionAllowed('submit', binding, dto);

    const instance = await this.submitWorkflowApproval('PI-PO-', '采购订单', id, binding, dto);

    // Also update PO's in-table approval fields for backward compatibility
    const operator = String(dto?.operator || dto?.username || 'system');
    const approver = String(dto?.approver || binding.approverRole || '');
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        approvalStatus: 'SUBMITTED',
        approvalStatusText: '审批中',
        approvalStatusState: 'Warning',
        processInstanceId: instance.id,
        processModelId: binding.id,
        processModelName: binding.name,
        submittedBy: operator,
        submittedAt: new Date(),
        currentApprover: approver,
        currentApproverRole: binding.approverRole || null,
      },
    });

    const history = await this.getApprovalHistory(instance.id);
    return this.mapPurchaseOrder(order, { binding, instance, history });
  }

  async approvePurchaseOrderApproval(id: string, dto: any) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { material: true } } },
    });
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('采购订单');
    if (!binding) {
      throw new BadRequestException('未配置可用的采购订单审批流程');
    }
    this.assertWorkflowActionAllowed('approve', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '采购订单',
      id,
      binding,
      dto,
      'APPROVE',
      '当前采购订单尚未提交审批',
    );

    // Also update PO's in-table approval fields for backward compatibility
    const operator = String(dto?.operator || dto?.username || binding.approverRole || 'system');
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvalStatusText: '已完成',
        approvalStatusState: 'Success',
        approvedBy: operator,
        approvedAt: new Date(),
        currentApprover: null,
        currentApproverRole: null,
      },
    });

    const history = await this.getApprovalHistory(instance.id);
    return this.mapPurchaseOrder(order, { binding, instance, history });
  }

  async rejectPurchaseOrderApproval(id: string, dto: any) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { material: true } } },
    });
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    const binding = await this.getWorkflowBindingByBusinessObject('采购订单');
    if (!binding) {
      throw new BadRequestException('未配置可用的采购订单审批流程');
    }
    this.assertWorkflowActionAllowed('reject', binding, dto);

    const instance = await this.completeWorkflowApproval(
      '采购订单',
      id,
      binding,
      dto,
      'REJECT',
      '当前采购订单尚未提交审批',
    );

    // Also update PO's in-table approval fields for backward compatibility
    const operator = String(dto?.operator || dto?.username || binding.approverRole || 'system');
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvalStatusText: '已驳回',
        approvalStatusState: 'Error',
        approvedBy: operator,
        approvedAt: new Date(),
        currentApprover: null,
        currentApproverRole: null,
      },
    });

    const history = await this.getApprovalHistory(instance.id);
    return this.mapPurchaseOrder(order, { binding, instance, history });
  }
}
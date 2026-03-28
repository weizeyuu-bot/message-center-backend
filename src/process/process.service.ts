import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { CreateFormConfigDto } from './dto/create-form-config.dto';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { CreateProcessModelDto } from './dto/create-process-model.dto';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';
import { UpdateFormConfigDto } from './dto/update-form-config.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';
import { UpdateProcessModelDto } from './dto/update-process-model.dto';

@Injectable()
export class ProcessService {
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

  listCategories() {
    return this.prisma.processCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  createCategory(dto: CreateProcessCategoryDto) {
    return this.prisma.processCategory.create({ data: dto });
  }

  updateCategory(id: string, dto: UpdateProcessCategoryDto) {
    return this.prisma.processCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.prisma.processCategory.delete({ where: { id } });
    return { success: true };
  }

  listForms() {
    return this.prisma.formConfig.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createForm(dto: CreateFormConfigDto) {
    return this.prisma.formConfig.create({ data: dto });
  }

  updateForm(id: string, dto: UpdateFormConfigDto) {
    return this.prisma.formConfig.update({ where: { id }, data: dto });
  }

  async deleteForm(id: string) {
    await this.prisma.formConfig.delete({ where: { id } });
    return { success: true };
  }

  listModels() {
    return this.prisma.processModel.findMany({
      include: {
        form: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createModel(dto: CreateProcessModelDto) {
    return this.prisma.processModel.create({ data: dto });
  }

  updateModel(id: string, dto: UpdateProcessModelDto) {
    return this.prisma.processModel.update({ where: { id }, data: dto });
  }

  async deleteModel(id: string) {
    await this.prisma.processModel.delete({ where: { id } });
    return { success: true };
  }

  listDeployments() {
    return this.prisma.deployment.findMany({
      include: {
        model: { include: { form: { include: { category: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDeployment(dto: CreateDeploymentDto) {
    return this.prisma.deployment.create({
      data: {
        deploymentId: dto.deploymentId,
        modelId: dto.modelId,
        environment: dto.environment,
        deployTime: dto.deployTime ? new Date(dto.deployTime) : undefined,
        publishedBy: dto.publishedBy,
        status: dto.status ?? 'PUBLISHED',
      },
    });
  }

  updateDeployment(id: string, dto: UpdateDeploymentDto) {
    return this.prisma.deployment.update({
      where: { id },
      data: {
        deploymentId: dto.deploymentId,
        modelId: dto.modelId,
        environment: dto.environment,
        deployTime: dto.deployTime ? new Date(dto.deployTime) : undefined,
        publishedBy: dto.publishedBy,
        status: dto.status,
      },
    });
  }

  async deleteDeployment(id: string) {
    await this.prisma.deployment.delete({ where: { id } });
    return { success: true };
  }

  async getWorkflowBindingByBusinessObject(businessObject: string) {
    const aliases = this.resolveBusinessAliases(businessObject);
    const models = await this.prisma.processModel.findMany({
      include: {
        form: true,
        deployments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const candidates = models
      .map((model) => {
        const schema = this.parseSchemaJson(model.form?.schemaJson);
        const schemaBusinessObject =
          typeof schema.businessObject === 'string' ? String(schema.businessObject) : '';
        const modelBusinessObject = model.businessObject || schemaBusinessObject;
        const normalizedModelBusinessObject = this.normalizeBusinessObjectKey(modelBusinessObject);
        if (!aliases.has(normalizedModelBusinessObject)) {
          return null;
        }

        const publishedDeployment = (model.deployments || []).find(
          (item) => item.status === 'PUBLISHED',
        );

        const initiatorRole =
          model.initiatorRole ||
          (typeof schema.initiatorRole === 'string' ? String(schema.initiatorRole) : '') ||
          model.form?.initiatorRole ||
          '';
        const approverRole =
          model.approverRole ||
          (typeof schema.approverRole === 'string' ? String(schema.approverRole) : '') ||
          model.form?.approverRole ||
          '';

        return {
          model,
          schemaBusinessObject,
          publishedDeployment,
          initiatorRole,
          approverRole,
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
      return {
        enabled: false,
        businessObject,
      };
    }

    return {
      enabled: true,
      businessObject,
      matchedBusinessObject: matched.model.businessObject || matched.schemaBusinessObject || '',
      modelId: matched.model.id,
      modelName: matched.model.name,
      formId: matched.model.formId,
      formName: matched.model.form?.name || '',
      initiatorRole: matched.initiatorRole,
      approverRole: matched.approverRole,
      deploymentId: matched.publishedDeployment?.deploymentId || '',
      deploymentStatus: matched.publishedDeployment?.status || '',
    };
  }
}

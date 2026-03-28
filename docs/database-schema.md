# 采购系统数据库表结构文档

> 数据库：PostgreSQL  
> ORM：Prisma  
> 生成时间：2026-03-28

---

## 目录

1. [用户与权限](#一用户与权限)
   - [User（用户）](#1-user用户)
   - [AppRole（角色）](#2-approle角色)
2. [供应链基础数据](#二供应链基础数据)
   - [Supplier（供应商）](#3-supplier供应商)
   - [Material（物料）](#4-material物料)
   - [PriceRecord（价格记录）](#5-pricerecord价格记录)
3. [采购业务](#三采购业务)
   - [PurchaseOrder（采购订单）](#6-purchaseorder采购订单)
   - [PurchaseOrderItem（采购订单行项目）](#7-purchaseorderitem采购订单行项目)
   - [DeliveryPlan（送货计划）](#8-deliveryplan送货计划)
   - [DeliveryPlanItem（送货计划行项目）](#9-deliveryplanitem送货计划行项目)
   - [Invoice（发票）](#10-invoice发票)
   - [InvoiceItem（发票行项目）](#11-invoiceitem发票行项目)
4. [流程管理](#四流程管理)
   - [ProcessCategory（流程分类）](#12-processcategory流程分类)
   - [FormConfig（表单配置）](#13-formconfig表单配置)
   - [ProcessModel（流程模型）](#14-processmodel流程模型)
   - [ProcessNode（流程节点）](#15-processnode流程节点)
   - [Deployment（部署记录）](#16-deployment部署记录)
   - [ProcessInstance（流程实例）](#17-processinstance流程实例)
   - [ApprovalActionLog（审批动作日志）](#18-approvalactionlog审批动作日志)
5. [表关系总览](#五表关系总览)
6. [枚举值说明](#六枚举值说明)

---

## 一、用户与权限

### 1. User（用户）

**表名**：`User`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| username | String | 是 | — | 登录账号，全局唯一 |
| name | String | 是 | — | 姓名 |
| email | String | 否 | — | 电子邮箱 |
| phone | String | 否 | — | 手机号 |
| department | String | 否 | — | 所属部门 |
| passwordHash | String | 是 | — | 密码哈希值（bcrypt） |
| role | String | 是 | `ROLE_BUYER` | 用户角色，见枚举 |
| status | String | 是 | `ACTIVE` | 账号状态：`ACTIVE` / `INACTIVE` |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`username`

---

### 2. AppRole（角色）

**表名**：`AppRole`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，如 `ROLE_ADMIN` |
| name | String | 是 | — | 角色显示名称 |
| description | String | 否 | — | 角色描述 |
| permissionJson | String | 否 | — | 权限配置（JSON 字符串） |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

---

## 二、供应链基础数据

### 3. Supplier（供应商）

**表名**：`Supplier`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `SUP001` |
| name | String | 是 | — | 供应商名称 |
| taxNumber | String | 否 | — | 税号 |
| address | String | 否 | — | 地址 |
| contact | String | 否 | — | 联系电话 |
| email | String | 否 | — | 联系邮箱 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `priceRecords` → `PriceRecord[]`（一对多）
- `orders` → `PurchaseOrder[]`（一对多）

---

### 4. Material（物料）

**表名**：`Material`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `MAT001` |
| name | String | 是 | — | 物料名称 |
| spec | String | 否 | — | 规格型号 |
| unit | String | 否 | — | 计量单位，如"个"、"箱" |
| stock | Int | 是 | `0` | 当前库存量 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `priceRecords` → `PriceRecord[]`（一对多）
- `orderItems` → `PurchaseOrderItem[]`（一对多）

---

### 5. PriceRecord（价格记录）

**表名**：`PriceRecord`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `PR001` |
| supplierId | String | 是 | — | 外键 → `Supplier.id` |
| materialId | String | 是 | — | 外键 → `Material.id` |
| unit | String | 否 | — | 计量单位 |
| validFrom | DateTime | 是 | — | 价格有效期开始 |
| validTo | DateTime | 是 | — | 价格有效期结束 |
| unitPrice | Float | 是 | — | 含税单价 |
| currency | String | 是 | `CNY` | 货币代码 |
| taxRate | Int | 是 | `13` | 税率（%） |
| remark | String | 否 | — | 备注 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**索引**：`supplierId`、`materialId`

---

## 三、采购业务

### 6. PurchaseOrder（采购订单）

**表名**：`PurchaseOrder`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `PO2024001` |
| supplierId | String | 是 | — | 外键 → `Supplier.id` |
| orderDate | DateTime | 是 | — | 订单日期 |
| status | String | 是 | — | 订单状态：`OPEN` / `CLOSED` / `CANCELLED` |
| approvalStatus | String | 是 | — | 审批状态，见枚举 |
| approvalStatusText | String | 否 | — | 审批状态展示文本 |
| approvalStatusState | String | 否 | — | UI 状态颜色：`Information` / `Warning` / `Success` / `Error` |
| processInstanceId | String | 否 | — | 关联流程实例 ID，唯一 |
| processModelId | String | 否 | — | 使用的流程模型 ID |
| processModelName | String | 否 | — | 流程模型名称（冗余） |
| createdBy | String | 否 | — | 创建人用户名 |
| creatorRole | String | 否 | — | 创建人角色 |
| submittedBy | String | 否 | — | 提交人用户名 |
| submittedAt | DateTime | 否 | — | 提交时间 |
| currentApprover | String | 否 | — | 当前审批人用户名 |
| currentApproverRole | String | 否 | — | 当前审批人角色 |
| approvedBy | String | 否 | — | 审批人用户名 |
| approvedAt | DateTime | 否 | — | 审批时间 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `supplier` → `Supplier`（多对一）
- `items` → `PurchaseOrderItem[]`（一对多）
- `deliveryPlans` → `DeliveryPlan[]`（一对多）
- `invoices` → `Invoice[]`（一对多）

**索引**：`supplierId`；`processInstanceId` 唯一

---

### 7. PurchaseOrderItem（采购订单行项目）

**表名**：`PurchaseOrderItem`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键（系统内部 ID） |
| purchaseOrderId | String | 是 | — | 外键 → `PurchaseOrder.id` |
| lineId | String | 是 | — | 行项目编号，如 `L1` |
| materialId | String | 是 | — | 外键 → `Material.id` |
| quantity | Float | 是 | — | 采购数量 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`(purchaseOrderId, lineId)`  
**索引**：`materialId`

---

### 8. DeliveryPlan（送货计划）

**表名**：`DeliveryPlan`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `DP2024001` |
| planDate | DateTime | 是 | — | 计划送货日期 |
| status | String | 是 | — | 状态：`PENDING` / `SHIPPED` / `RECEIVED` / `CANCELLED` |
| purchaseOrderId | String | 是 | — | 外键 → `PurchaseOrder.id` |
| itemCount | Int | 是 | `0` | 行项目数量（冗余统计） |
| totalQuantity | Float | 是 | `0` | 总送货数量（冗余统计） |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `purchaseOrder` → `PurchaseOrder`（多对一）
- `items` → `DeliveryPlanItem[]`（一对多）
- `invoices` → `Invoice[]`（一对多）

**索引**：`purchaseOrderId`

---

### 9. DeliveryPlanItem（送货计划行项目）

**表名**：`DeliveryPlanItem`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键（系统内部 ID） |
| deliveryPlanId | String | 是 | — | 外键 → `DeliveryPlan.id` |
| lineId | String | 是 | — | 行项目编号，如 `L1` |
| purchaseOrderId | String | 是 | — | 关联采购订单 ID |
| quantity | Float | 是 | — | 送货数量 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`(deliveryPlanId, lineId)`  
**索引**：`purchaseOrderId`

---

### 10. Invoice（发票）

**表名**：`Invoice`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `INV2024001` |
| invoiceDate | DateTime | 是 | — | 发票日期 |
| amount | Float | 是 | — | 发票总金额 |
| status | String | 是 | — | 状态：`PENDING` / `VERIFIED` / `PAID` / `CANCELLED` |
| purchaseOrderId | String | 是 | — | 外键 → `PurchaseOrder.id` |
| deliveryPlanId | String | 是 | — | 外键 → `DeliveryPlan.id` |
| itemCount | Int | 是 | `0` | 行项目数量（冗余统计） |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `purchaseOrder` → `PurchaseOrder`（多对一）
- `deliveryPlan` → `DeliveryPlan`（多对一）
- `items` → `InvoiceItem[]`（一对多）

**索引**：`purchaseOrderId`、`deliveryPlanId`

---

### 11. InvoiceItem（发票行项目）

**表名**：`InvoiceItem`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键（系统内部 ID） |
| invoiceId | String | 是 | — | 外键 → `Invoice.id` |
| lineId | String | 是 | — | 行项目编号，如 `L1` |
| purchaseOrderId | String | 是 | — | 关联采购订单 ID |
| deliveryPlanId | String | 是 | — | 关联送货计划 ID |
| amount | Float | 是 | — | 行项目金额 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`(invoiceId, lineId)`  
**索引**：`purchaseOrderId`、`deliveryPlanId`

---

## 四、流程管理

### 12. ProcessCategory（流程分类）

**表名**：`ProcessCategory`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| name | String | 是 | — | 分类名称，全局唯一 |
| description | String | 否 | — | 分类描述 |
| owner | String | 否 | — | 负责人 |
| status | String | 是 | `ACTIVE` | 状态：`ACTIVE` / `INACTIVE` |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`name`  
**关联**：`forms` → `FormConfig[]`（一对多）

---

### 13. FormConfig（表单配置）

**表名**：`FormConfig`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| name | String | 是 | — | 表单名称 |
| categoryId | String | 是 | — | 外键 → `ProcessCategory.id` |
| schemaJson | String | 否 | — | 表单字段定义（JSON 字符串） |
| businessObject | String | 否 | — | 关联业务对象，如 `PurchaseOrder` |
| initiatorRole | String | 否 | — | 发起人角色 |
| approverRole | String | 否 | — | 审批人角色 |
| status | String | 是 | `ACTIVE` | 状态：`ACTIVE` / `INACTIVE` |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `category` → `ProcessCategory`（多对一）
- `models` → `ProcessModel[]`（一对多）

---

### 14. ProcessModel（流程模型）

**表名**：`ProcessModel`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| name | String | 是 | — | 模型名称 |
| formId | String | 是 | — | 外键 → `FormConfig.id` |
| version | String | 是 | `v1` | 版本号 |
| status | String | 是 | `DRAFT` | 状态：`DRAFT` / `PUBLISHED` / `DEPRECATED` |
| businessObject | String | 否 | — | 关联业务对象 |
| initiatorRole | String | 否 | — | 发起人角色 |
| approverRole | String | 否 | — | 审批人角色 |
| nodeCount | Int | 是 | `0` | 节点数量（冗余统计） |
| description | String | 否 | — | 描述 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**关联**：
- `form` → `FormConfig`（多对一）
- `nodes` → `ProcessNode[]`（一对多）
- `deployments` → `Deployment[]`（一对多）
- `instances` → `ProcessInstance[]`（一对多）

---

### 15. ProcessNode（流程节点）

**表名**：`ProcessNode`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| modelId | String | 是 | — | 外键 → `ProcessModel.id` |
| nodeKey | String | 是 | — | 节点标识，模型内唯一 |
| nodeName | String | 是 | — | 节点名称 |
| nodeType | String | 是 | — | 节点类型：`start` / `approval` / `branch` / `end` 等 |
| nodeAction | String | 否 | — | 节点动作，如 `APPROVE` / `SUBMIT` |
| assigneeRole | String | 否 | — | 执行角色 |
| nodePolicy | String | 否 | — | 审批策略，如 `ANY` / `ALL` |
| branchSet | String | 否 | — | 分支组标识 |
| branchGroup | String | 否 | — | 分支组名 |
| branchMergeTo | String | 否 | — | 分支汇聚目标节点 |
| conditionField | String | 否 | — | 条件判断字段 |
| conditionOperator | String | 否 | — | 条件运算符，如 `>` / `=` |
| conditionValue | String | 否 | — | 条件判断值 |
| conditionIsDefault | Boolean | 否 | — | 是否为默认分支 |
| sla | String | 否 | — | 处理时限，如 `24h` |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`(modelId, nodeKey)`

---

### 16. Deployment（部署记录）

**表名**：`Deployment`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| deploymentId | String | 是 | — | 部署业务 ID，全局唯一 |
| modelId | String | 是 | — | 外键 → `ProcessModel.id` |
| environment | String | 是 | — | 部署环境，如 `production` |
| scope | String | 否 | — | 部署范围/部门 |
| deployTime | DateTime | 否 | — | 部署时间 |
| publishedBy | String | 否 | — | 发布操作人 |
| status | String | 是 | `PUBLISHED` | 状态：`PUBLISHED` / `REVOKED` |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**唯一约束**：`deploymentId`

---

### 17. ProcessInstance（流程实例）

**表名**：`ProcessInstance`

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String | 是 | — | 主键，业务编号如 `PI-PO-001` |
| modelId | String | 是 | — | 外键 → `ProcessModel.id` |
| businessId | String | 是 | — | 关联业务单据 ID，如采购订单号 |
| currentNode | String | 否 | — | 当前所在节点 Key |
| initiator | String | 否 | — | 发起人用户名 |
| initiatorRole | String | 否 | — | 发起人角色 |
| currentHandler | String | 否 | — | 当前处理人用户名 |
| statusText | String | 否 | — | 实例状态展示文本 |
| statusState | String | 否 | — | UI 状态颜色 |
| submittedAt | DateTime | 否 | — | 提交时间 |
| createdAt | DateTime | 是 | 当前时间 | 创建时间 |
| updatedAt | DateTime | 是 | 自动更新 | 最后更新时间 |

**索引**：`modelId`  
**关联**：`actionLogs` → `ApprovalActionLog[]`（一对多）

---

### 18. ApprovalActionLog（审批动作日志）

**表名**：`ApprovalActionLog`

> 审批轨迹表，每次提交/通过/驳回动作均写入一条记录，提供可审计的完整操作历史。

| 字段名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| id | String (UUID) | 是 | 自动生成 | 主键 |
| processInstanceId | String | 是 | — | 外键 → `ProcessInstance.id`（级联删除） |
| businessObject | String | 是 | — | 业务对象，如 `供应商` / `物料` / `送货计划` / `发票` |
| businessId | String | 是 | — | 业务单据 ID，如供应商或发票的 id |
| action | String | 是 | — | 动作类型：`SUBMIT` / `APPROVE` / `REJECT` |
| operator | String | 否 | — | 操作人用户名 |
| operatorRole | String | 否 | — | 操作人角色 |
| comment | String | 否 | — | 审批意见（驳回时必填） |
| statusText | String | 否 | — | 动作后的状态文本，如 `审批中` / `已完成` |
| statusState | String | 否 | — | 动作后的 UI 颜色状态 |
| createdAt | DateTime | 是 | 当前时间 | 记录创建时间（即动作发生时间） |

**索引**：`(processInstanceId, createdAt)`、`(businessObject, businessId, createdAt)`  
**关联**：`processInstance` → `ProcessInstance`（多对一，级联删除）

---

## 五、表关系总览

```
User
AppRole

Supplier ──────┬── PriceRecord ◄── Material
               └── PurchaseOrder ──┬── PurchaseOrderItem ◄── Material
                                   ├── DeliveryPlan ──── DeliveryPlanItem
                                   └── Invoice ─────────┬── InvoiceItem
                                                        └── (关联 DeliveryPlan)

ProcessCategory ── FormConfig ── ProcessModel ──┬── ProcessNode
                                                ├── Deployment
                                                └── ProcessInstance ── ApprovalActionLog
```

### 主要外键约束汇总

| 子表 | 外键字段 | 父表 |
|------|---------|------|
| PriceRecord | supplierId | Supplier |
| PriceRecord | materialId | Material |
| PurchaseOrder | supplierId | Supplier |
| PurchaseOrderItem | purchaseOrderId | PurchaseOrder |
| PurchaseOrderItem | materialId | Material |
| DeliveryPlan | purchaseOrderId | PurchaseOrder |
| DeliveryPlanItem | deliveryPlanId | DeliveryPlan |
| Invoice | purchaseOrderId | PurchaseOrder |
| Invoice | deliveryPlanId | DeliveryPlan |
| InvoiceItem | invoiceId | Invoice |
| FormConfig | categoryId | ProcessCategory |
| ProcessModel | formId | FormConfig |
| ProcessNode | modelId | ProcessModel |
| Deployment | modelId | ProcessModel |
| ProcessInstance | modelId | ProcessModel |
| ApprovalActionLog | processInstanceId | ProcessInstance |

---

## 六、枚举值说明

### 用户角色（User.role / AppRole.id）

| 值 | 说明 |
|----|------|
| `ROLE_ADMIN` | 系统管理员 |
| `ROLE_BUYER` | 采购专员 |
| `ROLE_PROCUREMENT_MANAGER` | 采购经理 |
| `ROLE_FINANCE` | 财务专员 |
| `ROLE_FINANCE_MANAGER` | 财务经理 |

### 用户状态（User.status）

| 值 | 说明 |
|----|------|
| `ACTIVE` | 正常 |
| `INACTIVE` | 停用 |

### 采购订单审批状态（PurchaseOrder.approvalStatus）

| 值 | 前端文本 | UI 颜色状态 |
|----|---------|------------|
| `DRAFT` | 草稿 | Information（蓝） |
| `SUBMITTED` | 已提交审批 | Warning（橙） |
| `APPROVED` | 已审批 | Success（绿） |
| `REJECTED` | 已驳回 | Error（红） |

### 采购订单状态（PurchaseOrder.status）

| 值 | 说明 |
|----|------|
| `OPEN` | 进行中 |
| `CLOSED` | 已关闭 |
| `CANCELLED` | 已取消 |

### 送货计划状态（DeliveryPlan.status）

| 值 | 说明 |
|----|------|
| `PENDING` | 待发货 |
| `SHIPPED` | 已发货 |
| `RECEIVED` | 已收货 |
| `CANCELLED` | 已取消 |

### 发票状态（Invoice.status）

| 值 | 说明 |
|----|------|
| `PENDING` | 待核验 |
| `VERIFIED` | 已核验 |
| `PAID` | 已付款 |
| `CANCELLED` | 已取消 |

### 流程模型状态（ProcessModel.status）

| 值 | 说明 |
|----|------|
| `DRAFT` | 草稿 |
| `PUBLISHED` | 已发布 |
| `DEPRECATED` | 已废弃 |

### 部署状态（Deployment.status）

| 值 | 说明 |
|----|------|
| `PUBLISHED` | 已发布 |
| `REVOKED` | 已撤回 |

### 审批动作类型（ApprovalActionLog.action）

| 值 | 前端文本 | UI 颜色状态 |
|----|---------|------------|
| `SUBMIT` | 提交审批 | Warning（橙） |
| `APPROVE` | 审批通过 | Success（绿） |
| `REJECT` | 审批驳回 | Error（红） |

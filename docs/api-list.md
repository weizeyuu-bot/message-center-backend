# 采购系统 API 接口清单

> 基础路径: `http://localhost:3000`  
> 认证: 除 `/api/auth/*` 外，其余接口均需携带 `Authorization: Bearer <JWT>` 请求头。

---

## 一、认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 请求体字段 | 需要认证 |
|------|------|------|-----------|---------|
| POST | `/api/auth/login` | 账号密码登录，返回 access_token + refresh_token | `username`, `password` | 否 |
| POST | `/api/auth/refresh` | 刷新访问令牌 | `refresh_token` | 否 |
| POST | `/api/auth/logout` | 注销（服务端使令牌失效） | — | 是 |

---

## 二、用户管理 `/api/users`

| 方法 | 路径 | 说明 | 请求体字段 |
|------|------|------|-----------|
| GET | `/api/users` | 查询用户列表（分页/过滤） | — |
| GET | `/api/users/:id` | 查询单个用户 | — |
| POST | `/api/users` | 新建用户 | `username`, `name`, `password`, `role`, `email?`, `phone?`, `department?`, `status?` |
| PATCH | `/api/users/:id` | 更新用户信息/角色/状态 | 见上，字段均可选 |
| DELETE | `/api/users/:id` | 删除用户 | — |

**角色枚举（role）**
- `ROLE_ADMIN` — 系统管理员
- `ROLE_BUYER` — 采购专员
- `ROLE_PROCUREMENT_MANAGER` — 采购经理
- `ROLE_FINANCE` — 财务专员
- `ROLE_FINANCE_MANAGER` — 财务经理

---

## 三、流程管理 `/api/process`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/process/categories` | 查询流程分类列表 |
| POST | `/api/process/categories` | 新建分类 |
| PATCH | `/api/process/categories/:id` | 更新分类 |
| DELETE | `/api/process/categories/:id` | 删除分类 |
| GET | `/api/process/form-configs` | 查询表单配置列表 |
| POST | `/api/process/form-configs` | 新建表单配置 |
| PATCH | `/api/process/form-configs/:id` | 更新表单配置 |
| DELETE | `/api/process/form-configs/:id` | 删除表单配置 |
| GET | `/api/process/process-models` | 查询流程模型列表 |
| POST | `/api/process/process-models` | 新建流程模型 |
| PATCH | `/api/process/process-models/:id` | 更新流程模型 |
| DELETE | `/api/process/process-models/:id` | 删除流程模型 |
| GET | `/api/process/deployments` | 查询部署列表 |
| POST | `/api/process/deployments` | 新建部署 |
| PATCH | `/api/process/deployments/:id` | 更新部署 |
| DELETE | `/api/process/deployments/:id` | 删除部署 |

---

## 四、业务模块 `/api/business`

### 4.1 供应商 `/api/business/suppliers`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/suppliers` | 查询供应商列表 | — |
| GET | `/api/business/suppliers/:id` | 查询单个供应商 | — |
| POST | `/api/business/suppliers` | 新建供应商 | `id`, `name`, `taxNumber?`, `address?`, `contact?`, `email?`, `status?` |
| PATCH | `/api/business/suppliers/:id` | 更新供应商 | 字段均可选 |
| DELETE | `/api/business/suppliers/:id` | 删除供应商 | — |

### 4.2 物料 `/api/business/materials`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/materials` | 查询物料列表 | — |
| GET | `/api/business/materials/:id` | 查询单个物料 | — |
| POST | `/api/business/materials` | 新建物料 | `id`, `name`, `unit?`, `category?`, `status?` |
| PATCH | `/api/business/materials/:id` | 更新物料 | 字段均可选 |
| DELETE | `/api/business/materials/:id` | 删除物料 | — |

### 4.3 价格库 `/api/business/price-records`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/price-records` | 查询价格记录列表 | — |
| GET | `/api/business/price-records/:id` | 查询单个价格记录 | — |
| POST | `/api/business/price-records` | 新建价格记录 | `id`, `supplierId`, `materialId`, `unitPrice`, `currency?`, `validFrom?`, `validTo?`, `status?` |
| PATCH | `/api/business/price-records/:id` | 更新价格记录 | 字段均可选 |
| DELETE | `/api/business/price-records/:id` | 删除价格记录 | — |

### 4.4 采购订单 `/api/business/purchase-orders`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/purchase-orders` | 查询采购订单列表（含行项目） | — |
| GET | `/api/business/purchase-orders/:id` | 查询单个采购订单 | — |
| POST | `/api/business/purchase-orders` | 新建采购订单 | `id`, `supplierId`, `date`, `status`, `approvalStatus?`, `items[]` |
| PATCH | `/api/business/purchase-orders/:id` | 更新采购订单（含审批状态推进） | 字段均可选，`items[]` 整体替换行项目 |
| DELETE | `/api/business/purchase-orders/:id` | 删除采购订单及行项目 | — |

**approvalStatus 枚举**
- `DRAFT` — 草稿
- `SUBMITTED` — 已提交
- `APPROVED` — 已审批
- `REJECTED` — 已驳回

**items[] 字段**: `lineId`, `materialId`, `quantity`, `unitPrice?`, `unit?`

### 4.5 送货计划 `/api/business/delivery-plans`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/delivery-plans` | 查询送货计划列表（含行项目） | — |
| GET | `/api/business/delivery-plans/:id` | 查询单个送货计划 | — |
| POST | `/api/business/delivery-plans` | 新建送货计划 | `id`, `status`, `items[]` |
| PATCH | `/api/business/delivery-plans/:id` | 更新送货计划 | 字段均可选 |
| DELETE | `/api/business/delivery-plans/:id` | 删除送货计划及行项目 | — |

**items[] 字段**: `lineId`, `purchaseOrderId`, `quantity`

### 4.6 发票 `/api/business/invoices`

| 方法 | 路径 | 说明 | 关键请求体字段 |
|------|------|------|--------------|
| GET | `/api/business/invoices` | 查询发票列表（含行项目） | — |
| GET | `/api/business/invoices/:id` | 查询单个发票 | — |
| POST | `/api/business/invoices` | 新建发票 | `id`, `status`, `items[]` |
| PATCH | `/api/business/invoices/:id` | 更新发票 | 字段均可选 |
| DELETE | `/api/business/invoices/:id` | 删除发票及行项目 | — |

**items[] 字段**: `lineId`, `purchaseOrderId`, `deliveryPlanId`, `amount`

---

## 五、权限说明（待完善）

| 接口组 | 当前状态 | 建议权限控制 |
|--------|---------|------------|
| `/api/auth/*` | ✅ 公开 | — |
| `/api/users/*` | 需 JWT | 仅 ADMIN 可写；自身可读/改密 |
| `/api/process/*` | 需 JWT | ADMIN + PROCUREMENT_MANAGER 可写 |
| `/api/business/suppliers` | 需 JWT | BUYER / PROCUREMENT_MANAGER 可写 |
| `/api/business/materials` | 需 JWT | BUYER / PROCUREMENT_MANAGER 可写 |
| `/api/business/price-records` | 需 JWT | PROCUREMENT_MANAGER 可写 |
| `/api/business/purchase-orders` | 需 JWT | BUYER 可写（提交），PROCUREMENT_MANAGER 可审批 |
| `/api/business/delivery-plans` | 需 JWT | BUYER 可写 |
| `/api/business/invoices` | 需 JWT | FINANCE / FINANCE_MANAGER 可写 |

---

## 六、前端对应关系

| 前端页面 | 使用接口 |
|---------|--------|
| 用户管理 | `GET/POST/PATCH/DELETE /api/users` |
| 用户明细 | `GET/PATCH /api/users/:id` |
| 供应商列表/明细 | `businessApi.loadSuppliers / saveSupplier / deleteSupplier` |
| 物料列表/明细 | `businessApi.loadMaterials / saveMaterial / deleteMaterial` |
| 价格库 | `businessApi.loadPriceRecords / savePriceRecord / deletePriceRecord` |
| 采购订单列表/明细 | `businessApi.loadPurchaseOrders / savePurchaseOrder / deletePurchaseOrder` |
| 采购订单快捷审批 | `businessApi.savePurchaseOrder`（更新 approvalStatus） |
| 送货计划列表/明细 | `businessApi.loadDeliveryPlans / saveDeliveryPlan / deleteDeliveryPlan` |
| 发票列表/明细 | `businessApi.loadInvoices / saveInvoice / deleteInvoice` |
| 流程管理 | `GET/POST/PATCH/DELETE /api/process/*` |

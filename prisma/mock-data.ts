export const mockRoles = [
  {
    id: 'ROLE_ADMIN',
    name: '系统管理员',
    description: '平台配置、用户与权限的全局管理',
    permissions: {
      suppliers: { query: true, operate: true },
      materials: { query: true, operate: true },
      priceLibrary: { query: true, operate: true },
      quoteManagement: { query: true, operate: true },
      purchaseOrders: { query: true, operate: true },
      deliveryPlans: { query: true, operate: true },
      invoices: { query: true, operate: true },
      users: { query: true, operate: true },
      roles: { query: true, operate: true },
      permissionManagement: { query: true, operate: true },
      processManagement: { query: true, operate: true },
      system: { query: true, operate: true },
    },
  },
  {
    id: 'ROLE_BUYER',
    name: '采购专员',
    description: '负责采购执行，具备业务录入与跟进权限',
    permissions: {
      suppliers: { query: true, operate: false },
      materials: { query: true, operate: false },
      priceLibrary: { query: true, operate: false },
      quoteManagement: { query: true, operate: true },
      purchaseOrders: { query: true, operate: true },
      deliveryPlans: { query: true, operate: true },
      invoices: { query: true, operate: false },
      users: { query: false, operate: false },
      roles: { query: false, operate: false },
      permissionManagement: { query: false, operate: false },
      processManagement: { query: false, operate: false },
      system: { query: false, operate: false },
    },
  },
  {
    id: 'ROLE_PROCUREMENT_MANAGER',
    name: '采购经理',
    description: '负责采购业务统筹、价格管理与执行监督',
    permissions: {
      suppliers: { query: true, operate: true },
      materials: { query: true, operate: true },
      priceLibrary: { query: true, operate: true },
      quoteManagement: { query: true, operate: true },
      purchaseOrders: { query: true, operate: true },
      deliveryPlans: { query: true, operate: true },
      invoices: { query: true, operate: false },
      users: { query: false, operate: false },
      roles: { query: false, operate: false },
      permissionManagement: { query: false, operate: false },
      processManagement: { query: false, operate: false },
      system: { query: false, operate: false },
    },
  },
  {
    id: 'ROLE_FINANCE',
    name: '财务专员',
    description: '负责开票与结算，聚焦对账与支付流程',
    permissions: {
      suppliers: { query: true, operate: false },
      materials: { query: true, operate: false },
      priceLibrary: { query: true, operate: false },
      quoteManagement: { query: false, operate: false },
      purchaseOrders: { query: true, operate: false },
      deliveryPlans: { query: true, operate: false },
      invoices: { query: true, operate: true },
      users: { query: false, operate: false },
      roles: { query: false, operate: false },
      permissionManagement: { query: false, operate: false },
      processManagement: { query: false, operate: false },
      system: { query: false, operate: false },
    },
  },
  {
    id: 'ROLE_FINANCE_MANAGER',
    name: '财务经理',
    description: '负责财务审核、发票结算与资金执行监督',
    permissions: {
      suppliers: { query: true, operate: false },
      materials: { query: true, operate: false },
      priceLibrary: { query: true, operate: false },
      quoteManagement: { query: true, operate: false },
      purchaseOrders: { query: true, operate: false },
      deliveryPlans: { query: true, operate: false },
      invoices: { query: true, operate: true },
      users: { query: false, operate: false },
      roles: { query: false, operate: false },
      permissionManagement: { query: false, operate: false },
      processManagement: { query: false, operate: false },
      system: { query: false, operate: false },
    },
  },
];

export const mockUsers = [
  { username: 'user1', name: 'User One', email: 'user1@example.com', phone: '13800000002', department: '采购部', role: 'ROLE_BUYER', status: 'ACTIVE', password: 'pass1' },
  { username: 'user2', name: 'Procurement Manager', email: 'user2@example.com', phone: '13800000003', department: '采购部', role: 'ROLE_PROCUREMENT_MANAGER', status: 'ACTIVE', password: 'pass2' },
  { username: 'user3', name: 'Finance Specialist', email: 'user3@example.com', phone: '13800000004', department: '财务部', role: 'ROLE_FINANCE', status: 'ACTIVE', password: 'pass3' },
  { username: 'user4', name: 'Supply Chain Coordinator', email: 'user4@example.com', phone: '13800000005', department: '供应链部', role: 'ROLE_BUYER', status: 'INACTIVE', password: 'pass4' },
  { username: 'user5', name: 'Buyer Five', email: 'user5@example.com', phone: '13800000006', department: '采购部', role: 'ROLE_BUYER', status: 'ACTIVE', password: 'pass5' },
  { username: 'user6', name: 'Finance Manager', email: 'user6@example.com', phone: '13800000007', department: '财务部', role: 'ROLE_FINANCE_MANAGER', status: 'ACTIVE', password: 'pass6' },
  { username: 'user7', name: 'Marketing Specialist', email: 'user7@example.com', phone: '13800000008', department: '市场部', role: 'ROLE_BUYER', status: 'DISABLED', password: 'pass7' },
];

export const mockSuppliers = [
  { id: 'SUP001', name: 'ABC Supplies', taxNumber: '123456789', address: '123 Main St, City A', contact: '123-456-7890', email: 'contact@abc.com' },
  { id: 'SUP002', name: 'XYZ Corp', taxNumber: '987654321', address: '456 Elm St, City B', contact: '987-654-3210', email: 'info@xyz.com' },
  { id: 'SUP003', name: 'Global Traders', taxNumber: '111222333', address: '789 Oak St, City C', contact: '111-222-3333', email: 'sales@global.com' },
  { id: 'SUP004', name: 'Tech Solutions', taxNumber: '444555666', address: '101 Pine St, City D', contact: '444-555-6666', email: 'support@tech.com' },
  { id: 'SUP005', name: 'Build Masters', taxNumber: '777888999', address: '202 Maple St, City E', contact: '777-888-9999', email: 'build@masters.com' },
  { id: 'SUP006', name: 'Food Essentials', taxNumber: '000111222', address: '303 Birch St, City F', contact: '000-111-2222', email: 'orders@essentials.com' },
  { id: 'SUP007', name: 'Auto Parts Inc', taxNumber: '333444555', address: '404 Cedar St, City G', contact: '333-444-5555', email: 'parts@auto.com' },
  { id: 'SUP008', name: 'Fashion Hub', taxNumber: '666777888', address: '505 Walnut St, City H', contact: '666-777-8888', email: 'fashion@hub.com' },
  { id: 'SUP009', name: 'Health Supplies', taxNumber: '999000111', address: '606 Spruce St, City I', contact: '999-000-1111', email: 'health@supplies.com' },
  { id: 'SUP010', name: 'Office Depot', taxNumber: '222333444', address: '707 Ash St, City J', contact: '222-333-4444', email: 'office@depot.com' },
  { id: 'SUP011', name: 'Green Energy', taxNumber: '555666777', address: '808 Fir St, City K', contact: '555-666-7777', email: 'green@energy.com' },
  { id: 'SUP012', name: 'Media Services', taxNumber: '888999000', address: '909 Poplar St, City L', contact: '888-999-0000', email: 'media@services.com' },
];

export const mockMaterials = [
  { id: 'MAT001', name: '钢材', spec: 'Q235', unit: '吨', stock: 120 },
  { id: 'MAT002', name: '水泥', spec: 'P.O 42.5', unit: '袋', stock: 340 },
  { id: 'MAT003', name: '砂', spec: '中砂', unit: '吨', stock: 210 },
  { id: 'MAT004', name: '电缆', spec: '3×2.5mm²', unit: '卷', stock: 75 },
  { id: 'MAT005', name: '油漆', spec: '环氧', unit: '桶', stock: 64 },
  { id: 'MAT006', name: '木方', spec: '50×100', unit: '米', stock: 380 },
  { id: 'MAT007', name: '玻璃', spec: '5mm', unit: '片', stock: 450 },
  { id: 'MAT008', name: '螺栓', spec: 'M12', unit: '箱', stock: 560 },
  { id: 'MAT009', name: '管道', spec: 'Φ50', unit: '米', stock: 120 },
  { id: 'MAT010', name: '绝缘材料', spec: 'PVC', unit: '卷', stock: 220 },
];

export const mockPriceRecords = [
  { id: 'PR001', supplierId: 'SUP001', materialId: 'MAT001', unit: '吨', validFrom: '2026-01-01', validTo: '2026-03-31', unitPrice: 4280, currency: 'CNY', taxRate: 13, remark: 'Q1框架协议价' },
  { id: 'PR002', supplierId: 'SUP001', materialId: 'MAT007', unit: '片', validFrom: '2026-02-01', validTo: '2026-04-30', unitPrice: 86, currency: 'CNY', taxRate: 13, remark: '月度执行价' },
  { id: 'PR003', supplierId: 'SUP002', materialId: 'MAT002', unit: '袋', validFrom: '2026-02-15', validTo: '2026-03-31', unitPrice: 32, currency: 'CNY', taxRate: 13, remark: '区域集采价' },
  { id: 'PR004', supplierId: 'SUP002', materialId: 'MAT008', unit: '箱', validFrom: '2026-03-01', validTo: '2026-06-30', unitPrice: 145, currency: 'CNY', taxRate: 13, remark: '季度锁价' },
  { id: 'PR005', supplierId: 'SUP003', materialId: 'MAT003', unit: '吨', validFrom: '2026-03-01', validTo: '2026-03-31', unitPrice: 118, currency: 'CNY', taxRate: 9, remark: '现货价' },
  { id: 'PR006', supplierId: 'SUP003', materialId: 'MAT009', unit: '米', validFrom: '2026-03-10', validTo: '2026-05-31', unitPrice: 54, currency: 'CNY', taxRate: 13, remark: '重点项目价' },
  { id: 'PR007', supplierId: 'SUP004', materialId: 'MAT004', unit: '卷', validFrom: '2026-03-01', validTo: '2026-04-15', unitPrice: 620, currency: 'CNY', taxRate: 13, remark: '含运包干价' },
  { id: 'PR008', supplierId: 'SUP004', materialId: 'MAT010', unit: '卷', validFrom: '2026-03-01', validTo: '2026-04-30', unitPrice: 210, currency: 'CNY', taxRate: 13, remark: '框架协议价' },
  { id: 'PR009', supplierId: 'SUP005', materialId: 'MAT005', unit: '桶', validFrom: '2026-02-20', validTo: '2026-03-20', unitPrice: 265, currency: 'CNY', taxRate: 13, remark: '阶段促销价' },
  { id: 'PR010', supplierId: 'SUP006', materialId: 'MAT006', unit: '米', validFrom: '2026-03-01', validTo: '2026-06-30', unitPrice: 18, currency: 'CNY', taxRate: 13, remark: '长期合作价' },
];

export const mockPurchaseOrders = [
  { id: 'PO001', supplierId: 'SUP001', orderDate: '2026-03-01', status: 'ORDERED', approvalStatus: 'APPROVED', approvalStatusText: '已审批', approvalStatusState: 'Success', processInstanceId: 'PI-PO-001', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user1', creatorRole: '采购专员', submittedBy: 'user1', submittedAt: '2026-03-01 09:10', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-01 11:25', items: [{ lineId: '10', materialId: 'MAT001', quantity: 12 }] },
  { id: 'PO002', supplierId: 'SUP002', orderDate: '2026-03-05', status: 'RECEIVED', approvalStatus: 'APPROVED', approvalStatusText: '已审批', approvalStatusState: 'Success', processInstanceId: 'PI-PO-002', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user5', creatorRole: '采购专员', submittedBy: 'user5', submittedAt: '2026-03-05 10:20', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-05 13:05', items: [{ lineId: '10', materialId: 'MAT002', quantity: 300 }] },
  { id: 'PO003', supplierId: 'SUP003', orderDate: '2026-03-08', status: 'PROCESSING', approvalStatus: 'SUBMITTED', approvalStatusText: '待采购经理审批', approvalStatusState: 'Warning', processInstanceId: 'PI-PO-003', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user1', creatorRole: '采购专员', submittedBy: 'user1', submittedAt: '2026-03-08 14:30', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: '', approvedAt: '', items: [{ lineId: '10', materialId: 'MAT003', quantity: 80 }] },
  { id: 'PO004', supplierId: 'SUP004', orderDate: '2026-03-10', status: 'ORDERED', approvalStatus: 'REJECTED', approvalStatusText: '采购经理驳回', approvalStatusState: 'Error', processInstanceId: 'PI-PO-004', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user5', creatorRole: '采购专员', submittedBy: 'user5', submittedAt: '2026-03-10 16:00', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-10 17:10', items: [{ lineId: '10', materialId: 'MAT004', quantity: 15 }] },
  { id: 'PO005', supplierId: 'SUP005', orderDate: '2026-03-12', status: 'CANCELLED', approvalStatus: 'DRAFT', approvalStatusText: '草稿待提交', approvalStatusState: 'Information', processInstanceId: '', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user1', creatorRole: '采购专员', submittedBy: '', submittedAt: '', currentApprover: '', currentApproverRole: '采购经理', approvedBy: '', approvedAt: '', items: [{ lineId: '10', materialId: 'MAT005', quantity: 40 }] },
  { id: 'PO006', supplierId: 'SUP006', orderDate: '2026-03-14', status: 'ORDERED', approvalStatus: 'APPROVED', approvalStatusText: '已审批', approvalStatusState: 'Success', processInstanceId: 'PI-PO-006', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user5', creatorRole: '采购专员', submittedBy: 'user5', submittedAt: '2026-03-14 09:45', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-14 10:30', items: [{ lineId: '10', materialId: 'MAT006', quantity: 500 }] },
  { id: 'PO007', supplierId: 'SUP001', orderDate: '2026-03-15', status: 'RECEIVED', approvalStatus: 'APPROVED', approvalStatusText: '已审批', approvalStatusState: 'Success', processInstanceId: 'PI-PO-007', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user1', creatorRole: '采购专员', submittedBy: 'user1', submittedAt: '2026-03-15 11:00', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-15 11:50', items: [{ lineId: '10', materialId: 'MAT007', quantity: 120 }] },
  { id: 'PO008', supplierId: 'SUP002', orderDate: '2026-03-17', status: 'PROCESSING', approvalStatus: 'SUBMITTED', approvalStatusText: '待采购经理审批', approvalStatusState: 'Warning', processInstanceId: 'PI-PO-008', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user5', creatorRole: '采购专员', submittedBy: 'user5', submittedAt: '2026-03-17 08:40', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: '', approvedAt: '', items: [{ lineId: '10', materialId: 'MAT008', quantity: 30 }] },
  { id: 'PO009', supplierId: 'SUP003', orderDate: '2026-03-18', status: 'ORDERED', approvalStatus: 'SUBMITTED', approvalStatusText: '待采购经理审批', approvalStatusState: 'Warning', processInstanceId: 'PI-PO-009', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user1', creatorRole: '采购专员', submittedBy: 'user1', submittedAt: '2026-03-18 15:35', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: '', approvedAt: '', items: [{ lineId: '10', materialId: 'MAT009', quantity: 260 }] },
  { id: 'PO010', supplierId: 'SUP004', orderDate: '2026-03-19', status: 'ORDERED', approvalStatus: 'APPROVED', approvalStatusText: '已审批', approvalStatusState: 'Success', processInstanceId: 'PI-PO-010', processModelId: 'PM_PO_APPROVAL_V1', processModelName: '采购订单审批流程', createdBy: 'user5', creatorRole: '采购专员', submittedBy: 'user5', submittedAt: '2026-03-19 10:05', currentApprover: 'user2', currentApproverRole: '采购经理', approvedBy: 'user2', approvedAt: '2026-03-19 12:40', items: [{ lineId: '10', materialId: 'MAT010', quantity: 22 }] },
];

export const mockDeliveryPlans = [
  { id: 'DP001', planDate: '2026-03-20', status: 'PENDING', purchaseOrderId: 'PO001', itemCount: 1, totalQuantity: 12, items: [{ lineId: '10', purchaseOrderId: 'PO001', quantity: 12 }] },
  { id: 'DP002', planDate: '2026-03-21', status: 'SHIPPED', purchaseOrderId: 'PO002', itemCount: 1, totalQuantity: 300, items: [{ lineId: '10', purchaseOrderId: 'PO002', quantity: 300 }] },
  { id: 'DP003', planDate: '2026-03-22', status: 'IN_TRANSIT', purchaseOrderId: 'PO003', itemCount: 1, totalQuantity: 80, items: [{ lineId: '10', purchaseOrderId: 'PO003', quantity: 80 }] },
  { id: 'DP004', planDate: '2026-03-23', status: 'DELIVERED', purchaseOrderId: 'PO004', itemCount: 1, totalQuantity: 15, items: [{ lineId: '10', purchaseOrderId: 'PO004', quantity: 15 }] },
  { id: 'DP005', planDate: '2026-03-24', status: 'PENDING', purchaseOrderId: 'PO005', itemCount: 1, totalQuantity: 40, items: [{ lineId: '10', purchaseOrderId: 'PO005', quantity: 40 }] },
  { id: 'DP006', planDate: '2026-03-25', status: 'SHIPPED', purchaseOrderId: 'PO006', itemCount: 1, totalQuantity: 500, items: [{ lineId: '10', purchaseOrderId: 'PO006', quantity: 500 }] },
  { id: 'DP007', planDate: '2026-03-26', status: 'IN_TRANSIT', purchaseOrderId: 'PO007', itemCount: 1, totalQuantity: 120, items: [{ lineId: '10', purchaseOrderId: 'PO007', quantity: 120 }] },
  { id: 'DP008', planDate: '2026-03-27', status: 'DELIVERED', purchaseOrderId: 'PO008', itemCount: 1, totalQuantity: 30, items: [{ lineId: '10', purchaseOrderId: 'PO008', quantity: 30 }] },
  { id: 'DP009', planDate: '2026-03-28', status: 'PENDING', purchaseOrderId: 'PO009', itemCount: 1, totalQuantity: 260, items: [{ lineId: '10', purchaseOrderId: 'PO009', quantity: 260 }] },
  { id: 'DP010', planDate: '2026-03-29', status: 'SHIPPED', purchaseOrderId: 'PO010', itemCount: 1, totalQuantity: 22, items: [{ lineId: '10', purchaseOrderId: 'PO010', quantity: 22 }] },
];

export const mockInvoices = [
  { id: 'INV001', invoiceDate: '2026-03-05', amount: 12000, status: 'INVOICED', purchaseOrderId: 'PO001', deliveryPlanId: 'DP001', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO001', deliveryPlanId: 'DP001', amount: 12000 }] },
  { id: 'INV002', invoiceDate: '2026-03-08', amount: 8500, status: 'PENDING', purchaseOrderId: 'PO002', deliveryPlanId: 'DP002', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO002', deliveryPlanId: 'DP002', amount: 8500 }] },
  { id: 'INV003', invoiceDate: '2026-03-10', amount: 16200, status: 'INVOICED', purchaseOrderId: 'PO003', deliveryPlanId: 'DP003', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO003', deliveryPlanId: 'DP003', amount: 16200 }] },
  { id: 'INV004', invoiceDate: '2026-03-12', amount: 4300, status: 'VOID', purchaseOrderId: 'PO004', deliveryPlanId: 'DP004', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO004', deliveryPlanId: 'DP004', amount: 4300 }] },
  { id: 'INV005', invoiceDate: '2026-03-14', amount: 9900, status: 'PENDING', purchaseOrderId: 'PO005', deliveryPlanId: 'DP005', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO005', deliveryPlanId: 'DP005', amount: 9900 }] },
  { id: 'INV006', invoiceDate: '2026-03-16', amount: 7600, status: 'INVOICED', purchaseOrderId: 'PO006', deliveryPlanId: 'DP006', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO006', deliveryPlanId: 'DP006', amount: 7600 }] },
  { id: 'INV007', invoiceDate: '2026-03-18', amount: 5200, status: 'PENDING', purchaseOrderId: 'PO007', deliveryPlanId: 'DP007', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO007', deliveryPlanId: 'DP007', amount: 5200 }] },
  { id: 'INV008', invoiceDate: '2026-03-19', amount: 14800, status: 'INVOICED', purchaseOrderId: 'PO008', deliveryPlanId: 'DP008', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO008', deliveryPlanId: 'DP008', amount: 14800 }] },
  { id: 'INV009', invoiceDate: '2026-03-20', amount: 6400, status: 'PENDING', purchaseOrderId: 'PO009', deliveryPlanId: 'DP009', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO009', deliveryPlanId: 'DP009', amount: 6400 }] },
  { id: 'INV010', invoiceDate: '2026-03-21', amount: 11000, status: 'INVOICED', purchaseOrderId: 'PO010', deliveryPlanId: 'DP010', itemCount: 1, items: [{ lineId: '10', purchaseOrderId: 'PO010', deliveryPlanId: 'DP010', amount: 11000 }] },
];

export const mockProcessCategories = [
  { id: 'pc1', name: '采购流程', description: '覆盖采购申请、采购订单、供应商协同等配置', owner: '采购平台主管' },
  { id: 'pc2', name: '审批流程', description: '用于采购、费用、合同等单据的审批策略配置', owner: '流程管理员' },
  { id: 'pc3', name: '出库流程', description: '用于仓储发运、签收回传等执行流程', owner: '仓储主管' },
  { id: 'pc4', name: '报销流程', description: '用于财务报销、借款、差旅审批等配置', owner: '财务经理' },
];

export const mockFormConfigs = [
  { id: 'F_PO_APPROVAL', name: '采购订单审批表单', categoryId: 'pc2', businessObject: '采购订单', initiatorRole: '采购专员', approverRole: '采购经理', fields: ['采购单号', '供应商', '物料明细', '订单金额', '价格匹配结果', '比价结论', '提交说明'] },
  { id: 'F_EXPENSE_APPROVAL', name: '报销单表单', categoryId: 'pc2', businessObject: '费用报销单', initiatorRole: '员工', approverRole: '财务经理', fields: ['金额', '类别', '说明', '附件'] },
  { id: 'F_LEAVE_APPROVAL', name: '请假单表单', categoryId: 'pc2', businessObject: '请假申请单', initiatorRole: '员工', approverRole: '部门经理', fields: ['开始时间', '结束时间', '请假类型', '原因'] },
  { id: 'F_OUTBOUND_APPROVAL', name: '出库审批表单', categoryId: 'pc3', businessObject: '出库单', initiatorRole: '仓库专员', approverRole: '仓储主管', fields: ['出库单号', '仓库', '物料明细', '发运说明'] },
];

export const mockProcessModels = [
  { id: 'PM_PO_APPROVAL_V1', name: '采购订单审批流程', formId: 'F_PO_APPROVAL', businessObject: '采购订单', initiatorRole: '采购专员', approverRole: '采购经理', version: '1.0', nodeCount: 6, status: 'PUBLISHED', description: '采购员创建采购订单后提交，系统自动流转至采购经理审批；当订单金额达到阈值时进入财务复核，否则走默认分支后结束。' },
  { id: 'PM_EXPENSE_APPROVAL_V11', name: '报销审批模型', formId: 'F_EXPENSE_APPROVAL', businessObject: '费用报销单', initiatorRole: '员工', approverRole: '财务经理', version: '1.1', nodeCount: 4, status: 'TESTING', description: '用于差旅与费用报销的审核流程。' },
  { id: 'PM_OUTBOUND_APPROVAL_V1', name: '出库审批模型', formId: 'F_OUTBOUND_APPROVAL', businessObject: '出库单', initiatorRole: '仓库专员', approverRole: '仓储主管', version: '1.0', nodeCount: 3, status: 'PUBLISHED', description: '用于仓储发货前的出库审核。' },
];

export const mockDeployments = [
  { id: 'DEP-PO-001', deploymentId: 'DEP-PO-001', modelId: 'PM_PO_APPROVAL_V1', environment: '生产环境', scope: '采购订单单据', deployTime: '2026-03-20 10:00', publishedBy: 'admin', status: 'PUBLISHED' },
  { id: 'DEP-EXP-002', deploymentId: 'DEP-EXP-002', modelId: 'PM_EXPENSE_APPROVAL_V11', environment: '测试环境', scope: '费用报销单', deployTime: '2026-03-22 13:20', publishedBy: 'admin', status: 'PUBLISHED' },
  { id: 'DEP-OUT-003', deploymentId: 'DEP-OUT-003', modelId: 'PM_OUTBOUND_APPROVAL_V1', environment: '测试环境', scope: '出库单', deployTime: '2026-03-24 09:10', publishedBy: 'admin', status: 'CANCELLED' },
];

export const mockProcessNodes = [
  { id: 'PM_PO_APPROVAL_V1-N1', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N1', nodeName: '采购员创建', nodeType: '发起节点', nodeAction: '创建采购订单并填写明细', assigneeRole: '采购专员', sla: '0.5' },
  { id: 'PM_PO_APPROVAL_V1-N2', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N2', nodeName: '提交审批', nodeType: '提交节点', nodeAction: '校验价格与供应商后提交', assigneeRole: '采购专员', sla: '0.5' },
  { id: 'PM_PO_APPROVAL_V1-N3', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N3', nodeName: '经理审批', nodeType: '审批节点', nodeAction: '采购经理审批通过/驳回', assigneeRole: '采购经理', sla: '1' },
  { id: 'PM_PO_APPROVAL_V1-N4', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N4', nodeName: '大额采购复核', nodeType: '审批节点', nodeAction: '当订单金额达到阈值时触发财务复核', assigneeRole: '财务经理', nodePolicy: 'CONDITIONAL', branchSet: 'CS_AMOUNT', branchGroup: 'CG_AMOUNT', branchMergeTo: 'N6', conditionField: '订单金额', conditionOperator: 'GTE', conditionValue: '100000', conditionIsDefault: false, sla: '0.5' },
  { id: 'PM_PO_APPROVAL_V1-N5', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N5', nodeName: '常规订单直通', nodeType: '执行节点', nodeAction: '未命中大额条件时走默认分支并直接归档', assigneeRole: '系统', nodePolicy: 'CONDITIONAL', branchSet: 'CS_AMOUNT', branchGroup: 'CG_DEFAULT', branchMergeTo: 'N6', conditionIsDefault: true, sla: '0.2' },
  { id: 'PM_PO_APPROVAL_V1-N6', modelId: 'PM_PO_APPROVAL_V1', nodeKey: 'N6', nodeName: '流程结束', nodeType: '结束节点', nodeAction: '归档审批结果', assigneeRole: '系统', sla: '0.2' },
  { id: 'PM_EXPENSE_APPROVAL_V11-N1', modelId: 'PM_EXPENSE_APPROVAL_V11', nodeKey: 'N1', nodeName: '员工提交', nodeType: '发起节点', nodeAction: '提交报销单', assigneeRole: '员工', sla: '0.5' },
  { id: 'PM_EXPENSE_APPROVAL_V11-N2', modelId: 'PM_EXPENSE_APPROVAL_V11', nodeKey: 'N2', nodeName: '直属主管审批', nodeType: '审批节点', nodeAction: '直属主管审核', assigneeRole: '部门经理', sla: '1' },
  { id: 'PM_EXPENSE_APPROVAL_V11-N3', modelId: 'PM_EXPENSE_APPROVAL_V11', nodeKey: 'N3', nodeName: '财务复核', nodeType: '审批节点', nodeAction: '财务经理复核', assigneeRole: '财务经理', sla: '1' },
  { id: 'PM_EXPENSE_APPROVAL_V11-N4', modelId: 'PM_EXPENSE_APPROVAL_V11', nodeKey: 'N4', nodeName: '归档', nodeType: '结束节点', nodeAction: '流程归档', assigneeRole: '系统', sla: '0.2' },
  { id: 'PM_OUTBOUND_APPROVAL_V1-N1', modelId: 'PM_OUTBOUND_APPROVAL_V1', nodeKey: 'N1', nodeName: '仓库发起', nodeType: '发起节点', nodeAction: '创建出库单', assigneeRole: '仓库专员', sla: '0.5' },
  { id: 'PM_OUTBOUND_APPROVAL_V1-N2', modelId: 'PM_OUTBOUND_APPROVAL_V1', nodeKey: 'N2', nodeName: '主管审批', nodeType: '审批节点', nodeAction: '仓储主管审批', assigneeRole: '仓储主管', sla: '1' },
  { id: 'PM_OUTBOUND_APPROVAL_V1-N3', modelId: 'PM_OUTBOUND_APPROVAL_V1', nodeKey: 'N3', nodeName: '执行出库', nodeType: '执行节点', nodeAction: '完成拣货发运', assigneeRole: '仓库专员', sla: '0.5' },
];

export const mockProcessInstances = [
  { id: 'PI-PO-003', modelId: 'PM_PO_APPROVAL_V1', businessId: 'PO003', currentNode: '经理审批', initiator: 'user1', initiatorRole: '采购专员', currentHandler: 'user2', statusText: '审批中', statusState: 'Warning', submittedAt: '2026-03-08 14:30' },
  { id: 'PI-PO-008', modelId: 'PM_PO_APPROVAL_V1', businessId: 'PO008', currentNode: '经理审批', initiator: 'user5', initiatorRole: '采购专员', currentHandler: 'user2', statusText: '审批中', statusState: 'Warning', submittedAt: '2026-03-17 08:40' },
  { id: 'PI-PO-004', modelId: 'PM_PO_APPROVAL_V1', businessId: 'PO004', currentNode: '流程结束', initiator: 'user5', initiatorRole: '采购专员', currentHandler: 'user2', statusText: '已驳回', statusState: 'Error', submittedAt: '2026-03-10 16:00' },
  { id: 'PI-PO-010', modelId: 'PM_PO_APPROVAL_V1', businessId: 'PO010', currentNode: '流程结束', initiator: 'user5', initiatorRole: '采购专员', currentHandler: 'user2', statusText: '已完成', statusState: 'Success', submittedAt: '2026-03-19 10:05' },
];
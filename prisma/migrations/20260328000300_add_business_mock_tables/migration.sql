-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "scope" TEXT;

-- AlterTable
ALTER TABLE "FormConfig" ADD COLUMN     "approverRole" TEXT,
ADD COLUMN     "businessObject" TEXT,
ADD COLUMN     "initiatorRole" TEXT;

-- AlterTable
ALTER TABLE "ProcessCategory" ADD COLUMN     "owner" TEXT;

-- AlterTable
ALTER TABLE "ProcessModel" ADD COLUMN     "approverRole" TEXT,
ADD COLUMN     "businessObject" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "initiatorRole" TEXT,
ADD COLUMN     "nodeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProcessNode" ADD COLUMN     "assigneeRole" TEXT,
ADD COLUMN     "branchMergeTo" TEXT,
ADD COLUMN     "branchSet" TEXT,
ADD COLUMN     "conditionIsDefault" BOOLEAN,
ADD COLUMN     "nodeAction" TEXT,
ADD COLUMN     "nodePolicy" TEXT,
ADD COLUMN     "sla" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ROLE_BUYER';

-- CreateTable
CREATE TABLE "AppRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissionJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxNumber" TEXT,
    "address" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "unit" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceRecord" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "unit" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "taxRate" INTEGER NOT NULL DEFAULT 13,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "approvalStatusText" TEXT,
    "approvalStatusState" TEXT,
    "processInstanceId" TEXT,
    "processModelId" TEXT,
    "processModelName" TEXT,
    "createdBy" TEXT,
    "creatorRole" TEXT,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "currentApprover" TEXT,
    "currentApproverRole" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPlan" (
    "id" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPlanItem" (
    "id" TEXT NOT NULL,
    "deliveryPlanId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "deliveryPlanId" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "deliveryPlanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessInstance" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "currentNode" TEXT,
    "initiator" TEXT,
    "initiatorRole" TEXT,
    "currentHandler" TEXT,
    "statusText" TEXT,
    "statusState" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceRecord_supplierId_idx" ON "PriceRecord"("supplierId");

-- CreateIndex
CREATE INDEX "PriceRecord_materialId_idx" ON "PriceRecord"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_processInstanceId_key" ON "PurchaseOrder"("processInstanceId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_materialId_idx" ON "PurchaseOrderItem"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderItem_purchaseOrderId_lineId_key" ON "PurchaseOrderItem"("purchaseOrderId", "lineId");

-- CreateIndex
CREATE INDEX "DeliveryPlan_purchaseOrderId_idx" ON "DeliveryPlan"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "DeliveryPlanItem_purchaseOrderId_idx" ON "DeliveryPlanItem"("purchaseOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPlanItem_deliveryPlanId_lineId_key" ON "DeliveryPlanItem"("deliveryPlanId", "lineId");

-- CreateIndex
CREATE INDEX "Invoice_purchaseOrderId_idx" ON "Invoice"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Invoice_deliveryPlanId_idx" ON "Invoice"("deliveryPlanId");

-- CreateIndex
CREATE INDEX "InvoiceItem_purchaseOrderId_idx" ON "InvoiceItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "InvoiceItem_deliveryPlanId_idx" ON "InvoiceItem"("deliveryPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_invoiceId_lineId_key" ON "InvoiceItem"("invoiceId", "lineId");

-- CreateIndex
CREATE INDEX "ProcessInstance_modelId_idx" ON "ProcessInstance"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessNode_modelId_nodeKey_key" ON "ProcessNode"("modelId", "nodeKey");

-- AddForeignKey
ALTER TABLE "PriceRecord" ADD CONSTRAINT "PriceRecord_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceRecord" ADD CONSTRAINT "PriceRecord_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPlan" ADD CONSTRAINT "DeliveryPlan_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPlanItem" ADD CONSTRAINT "DeliveryPlanItem_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "DeliveryPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "DeliveryPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInstance" ADD CONSTRAINT "ProcessInstance_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProcessModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

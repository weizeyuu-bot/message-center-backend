-- CreateTable
CREATE TABLE "ApprovalActionLog" (
    "id" TEXT NOT NULL,
    "processInstanceId" TEXT NOT NULL,
    "businessObject" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "operator" TEXT,
    "operatorRole" TEXT,
    "comment" TEXT,
    "statusText" TEXT,
    "statusState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalActionLog_processInstanceId_createdAt_idx" ON "ApprovalActionLog"("processInstanceId", "createdAt");

-- CreateIndex
CREATE INDEX "ApprovalActionLog_businessObject_businessId_createdAt_idx" ON "ApprovalActionLog"("businessObject", "businessId", "createdAt");

-- AddForeignKey
ALTER TABLE "ApprovalActionLog" ADD CONSTRAINT "ApprovalActionLog_processInstanceId_fkey" FOREIGN KEY ("processInstanceId") REFERENCES "ProcessInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
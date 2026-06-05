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
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "database" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "schema" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "sql" TEXT NOT NULL,
    "columnsJson" TEXT,
    "messageTemplate" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotifyChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configJson" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotifyChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cronExpr" TEXT NOT NULL,
    "queryTemplateId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "messageTitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskRunLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rowCount" INTEGER,
    "message" TEXT,
    "content" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "DataSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NotifyChannel_name_key" ON "NotifyChannel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledTask_name_key" ON "ScheduledTask"("name");

-- CreateIndex
CREATE INDEX "QueryTemplate_dataSourceId_idx" ON "QueryTemplate"("dataSourceId");

-- CreateIndex
CREATE INDEX "ScheduledTask_queryTemplateId_idx" ON "ScheduledTask"("queryTemplateId");

-- CreateIndex
CREATE INDEX "ScheduledTask_channelId_idx" ON "ScheduledTask"("channelId");

-- CreateIndex
CREATE INDEX "TaskRunLog_taskId_createdAt_idx" ON "TaskRunLog"("taskId", "createdAt");

-- AddForeignKey
ALTER TABLE "QueryTemplate" ADD CONSTRAINT "QueryTemplate_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_queryTemplateId_fkey" FOREIGN KEY ("queryTemplateId") REFERENCES "QueryTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "NotifyChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRunLog" ADD CONSTRAINT "TaskRunLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ScheduledTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

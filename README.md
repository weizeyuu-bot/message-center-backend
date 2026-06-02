# Message Center Backend

采购协同系统后端服务，基于 NestJS + Prisma + PostgreSQL + Redis。

## 文档导航

- 技术栈总览：[docs/tech-stack.md](docs/tech-stack.md)
- API 接口清单：[docs/api-list.md](docs/api-list.md)
- 数据库表结构文档：[docs/database-schema.md](docs/database-schema.md)
- Linux 生产部署文档：[docs/production-deployment-linux.md](docs/production-deployment-linux.md)

## 技术栈

- 框架：NestJS 11、TypeScript 5
- 鉴权：JWT、bcryptjs
- 数据访问：Prisma ORM
- 数据库：PostgreSQL 16
- 缓存：Redis 7
- 工具链：ESLint、Prettier、Jest

## 目录说明

- src：后端业务代码（auth/users/business/process/common）
- prisma：Prisma Schema、迁移、种子脚本
- docs：项目文档（技术栈、API、数据库）

## 环境准备

1. Node.js 20+
2. Docker Desktop（用于本地 PostgreSQL/Redis）
3. npm 10+

## 环境变量

可基于 .env.example 创建 .env：

```bash
PORT=3000
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=change-me-in-prod
DATABASE_URL=postgresql://purchase:purchase@localhost:5432/purchase_db?schema=public
REDIS_URL=redis://localhost:6379
ADMIN_USERNAME=admin
ADMIN_NAME=系统管理员
ADMIN_PASSWORD=Admin@123456
ADMIN_ROLE=ROLE_ADMIN
```

注意：.env.example 里的 ADMIN_ROLE 若为 ADMIN，建议改为 ROLE_ADMIN 与后端默认逻辑保持一致。

## 安装依赖

```bash
npm install
```

## 启动方式

### 方式一：一键联调（推荐）

```bash
npm run dev:all
```

该命令会先启动 Docker 依赖，再并行启动后端与前端（前端位于上级目录的 ui5-message-center）。

### 方式二：分步启动

```bash
# 1) 启动数据库与缓存
npm run db:up

# 2) 启动后端
npm run start:dev

# 3) 在另一个终端启动前端
npm --prefix ..\ui5-message-center run start
```

## 常用命令

```bash
# 关闭数据库与缓存
npm run db:down

# 生成 Prisma Client
npm run prisma:generate

# 执行迁移
npm run prisma:migrate

# 执行种子数据
npm run prisma:seed

# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 打包 + 生产模式运行
npm run build
npm run start:prod
```

## 本地访问

- 后端健康入口：http://localhost:3000/api
- 前端入口：http://localhost:8080

## 常见问题

1. docker 引擎连接失败

现象：运行 npm run dev:all 时提示无法连接 dockerDesktopLinuxEngine。  
处理：先启动 Docker Desktop 再重试。

2. Prisma generate 报 EPERM（Windows）

现象：query_engine-windows.dll.node 被占用。  
处理：先停止正在运行的 Nest 进程，再执行 prisma 命令。

## 许可

UNLICENSED（以仓库实际声明为准）。

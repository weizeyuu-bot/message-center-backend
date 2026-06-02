# Linux 生产部署指南（Message Center）

本文档用于将当前项目发布到 Linux 生产服务器，采用以下部署形态：

- 前端：OpenUI5 构建为静态资源，由 Nginx 托管
- 后端：NestJS 构建产物由 PM2 托管
- 数据与缓存：PostgreSQL + Redis（Docker Compose）
- 反向代理：Nginx 统一入口（HTTPS）

## 1. 部署目标与拓扑

- 对外域名示例：`mc.example.com`
- 前端入口：`https://mc.example.com/`
- 后端入口：`https://mc.example.com/api`
- 内部服务：
  - NestJS：`127.0.0.1:3000`
  - PostgreSQL：`127.0.0.1:5432`
  - Redis：`127.0.0.1:6379`

```mermaid
flowchart LR
  Browser[User Browser] --> Nginx[Nginx :443]
  Nginx --> UI[UI5 Static Files]
  Nginx --> API[NestJS :3000]
  API --> PG[(PostgreSQL :5432)]
  API --> RD[(Redis :6379)]
```

## 2. 服务器前置要求

建议系统：Ubuntu 22.04 LTS。

需要安装：

- Node.js 20+
- npm 10+
- git
- docker + docker compose
- nginx
- pm2（全局）

示例命令：

```bash
sudo apt update
sudo apt install -y git curl nginx ca-certificates gnupg lsb-release

# Node.js 20（NodeSource）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker

# PM2
sudo npm install -g pm2
```

## 3. 目录规划

建议使用可回滚目录结构：

```bash
/opt/message-center/
  releases/
    20260602-120000/
    20260605-091500/
  shared/
    backend.env
  current -> /opt/message-center/releases/20260605-091500
```

说明：

- 每次发布到新时间戳目录
- `current` 软链接指向当前线上版本
- 敏感配置放 `shared/backend.env`

## 4. 拉取代码与安装依赖

```bash
sudo mkdir -p /opt/message-center/releases
sudo mkdir -p /opt/message-center/shared
sudo chown -R $USER:$USER /opt/message-center

cd /opt/message-center/releases
RELEASE=$(date +%Y%m%d-%H%M%S)
mkdir $RELEASE
cd $RELEASE

git clone <你的仓库地址> .

cd message-center-backend
npm ci

cd ../ui5-message-center
npm ci
```

## 5. 生产环境变量（后端）

创建 `/opt/message-center/shared/backend.env`：

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://mc.example.com
JWT_SECRET=请替换为高强度随机字符串
DATABASE_URL=postgresql://purchase:strong_password@127.0.0.1:5432/purchase_db?schema=public
REDIS_URL=redis://127.0.0.1:6379

# 首次初始化管理员时使用，后续可保留或移除
ADMIN_USERNAME=admin
ADMIN_NAME=系统管理员
ADMIN_PASSWORD=请替换强密码
ADMIN_ROLE=ROLE_ADMIN
```

生产建议：

- `JWT_SECRET` 长度不少于 32 位
- `CORS_ORIGIN` 填写真实前端域名
- 数据库密码不要使用示例值

## 6. 启动 PostgreSQL / Redis（Docker）

本仓库后端目录已有 `docker-compose.yml`，可直接使用：

```bash
cd /opt/message-center/releases/$RELEASE/message-center-backend
docker compose up -d
```

检查状态：

```bash
docker compose ps
docker logs purchase-postgres --tail 100
docker logs purchase-redis --tail 100
```

## 7. 数据库迁移与种子

```bash
cd /opt/message-center/releases/$RELEASE/message-center-backend
set -a
source /opt/message-center/shared/backend.env
set +a

npm run prisma:generate
npx prisma migrate deploy

# 首次部署可执行（已有生产数据时慎用）
npm run prisma:seed
```

说明：

- 生产环境必须使用 `prisma migrate deploy`，不要使用 `prisma migrate dev`
- 种子脚本用于初始化演示或基础配置，生产执行前请确认策略

## 8. 后端构建与 PM2 托管

### 8.1 构建后端

```bash
cd /opt/message-center/releases/$RELEASE/message-center-backend
npm run build
```

### 8.2 新建 PM2 配置

创建 `message-center-backend/ecosystem.config.cjs`：

```js
module.exports = {
  apps: [
    {
      name: 'message-center-backend',
      script: 'dist/main.js',
      cwd: '/opt/message-center/current/message-center-backend',
      instances: 1,
      exec_mode: 'fork',
      env_file: '/opt/message-center/shared/backend.env',
      max_memory_restart: '512M',
      out_file: '/var/log/message-center/backend-out.log',
      error_file: '/var/log/message-center/backend-error.log',
      merge_logs: true,
      time: true
    }
  ]
};
```

创建日志目录并授权：

```bash
sudo mkdir -p /var/log/message-center
sudo chown -R $USER:$USER /var/log/message-center
```

### 8.3 启动 PM2

```bash
ln -sfn /opt/message-center/releases/$RELEASE /opt/message-center/current
cd /opt/message-center/current/message-center-backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

执行 `pm2 startup` 输出的系统命令，确保开机自启生效。

## 9. 前端构建与发布

```bash
cd /opt/message-center/current/ui5-message-center
npm run build
```

构建产物默认在 `ui5-message-center/dist`。

## 10. Nginx 配置（HTTPS + 反向代理）

创建 `/etc/nginx/sites-available/message-center.conf`：

```nginx
server {
    listen 80;
    server_name mc.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mc.example.com;

    # 证书路径（由 certbot 生成）
    ssl_certificate /etc/letsencrypt/live/mc.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mc.example.com/privkey.pem;

    root /opt/message-center/current/ui5-message-center/dist;
    index index.html;

    # 前端静态资源
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/message-center.conf /etc/nginx/sites-enabled/message-center.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 11. 申请 HTTPS 证书（Let’s Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mc.example.com
```

检查自动续期：

```bash
sudo systemctl status certbot.timer
```

## 12. 发布后验证清单

```bash
# 后端健康检查
curl -i https://mc.example.com/api

# PM2 状态
pm2 list
pm2 logs message-center-backend --lines 200

# Nginx 状态
sudo systemctl status nginx
sudo tail -n 200 /var/log/nginx/error.log
```

功能验收建议：

- 登录与刷新令牌
- 首页统计图表加载
- 数据源/查询模板增删改查
- 通知通道（含邮件）发送测试
- 定时任务执行与日志查看

## 13. 回滚方案

如果新版本异常，执行以下命令回滚到上一个版本：

```bash
cd /opt/message-center/releases
ls -1

# 假设回滚到 20260602-120000
ln -sfn /opt/message-center/releases/20260602-120000 /opt/message-center/current

cd /opt/message-center/current/message-center-backend
pm2 restart message-center-backend
sudo systemctl reload nginx
```

回滚完成后，立即执行健康检查与关键功能冒烟测试。

## 14. 常见问题排查

### 14.1 前端打开空白或路由 404

- 检查 Nginx `try_files $uri $uri/ /index.html`
- 确认 `dist` 目录存在且有最新构建

### 14.2 `/api` 返回 502

- 检查 `pm2 list` 是否在线
- 检查后端日志 `/var/log/message-center/backend-error.log`
- 检查 `proxy_pass` 是否与后端端口一致

### 14.3 后端启动报数据库连接失败

- 检查 `DATABASE_URL`
- 检查 PostgreSQL 容器是否正常
- 用 `docker logs purchase-postgres` 查看初始化状态

### 14.4 跨域失败

- 检查 `CORS_ORIGIN` 与前端域名一致
- 修改后 `pm2 restart message-center-backend`

### 14.5 Prisma 迁移失败

- 使用 `npx prisma migrate status` 查看状态
- 确认使用的是 `migrate deploy` 而非 `migrate dev`

## 15. 安全加固建议

- 仅开放 80/443，关闭 3000/5432/6379 对公网暴露
- 为 PostgreSQL 设置强密码并限制来源 IP
- 定期备份数据库（至少每日一次）
- 配置日志轮转（logrotate）避免日志占满磁盘
- 将 `JWT_SECRET`、数据库密码托管到密钥服务（如 Vault）

## 16. 一次性发布命令示例（可复制）

```bash
cd /opt/message-center/releases
RELEASE=$(date +%Y%m%d-%H%M%S)
mkdir $RELEASE && cd $RELEASE

git clone <你的仓库地址> .

cd message-center-backend && npm ci
cd ../ui5-message-center && npm ci

cd ../message-center-backend
docker compose up -d
set -a && source /opt/message-center/shared/backend.env && set +a
npm run prisma:generate
npx prisma migrate deploy
npm run build

cd ../ui5-message-center
npm run build

ln -sfn /opt/message-center/releases/$RELEASE /opt/message-center/current
cd /opt/message-center/current/message-center-backend
pm2 start ecosystem.config.cjs || pm2 restart message-center-backend
sudo systemctl reload nginx
```

---

如需扩展为 CI/CD 自动部署，建议下一步接入 GitHub Actions 或 GitLab CI，按“构建 -> 产物上传 -> 远程发布 -> 健康检查 -> 自动回滚”流水线执行。

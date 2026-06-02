# Message Center API 接口清单

> 基础路径：/api
> 
> 鉴权：除公开接口外，其余接口均需要 Authorization: Bearer <JWT>

## 1. 公开接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api | 健康检查 |
| POST | /api/auth/login | 登录 |
| POST | /api/auth/refresh | 刷新令牌 |

说明：
- refresh 接口要求 Header 里带 Authorization: Bearer <access_token>
- refresh 接口 Body 需传 refresh_token

## 2. 认证模块 /api/auth

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| POST | /api/auth/login | 用户登录 | username, password |
| POST | /api/auth/refresh | 刷新访问令牌 | refresh_token |

## 3. 用户模块 /api/users

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/users | 用户列表 | - |
| GET | /api/users/:id | 用户详情 | - |
| POST | /api/users | 创建用户 | username, name, password, role, email?, phone?, department?, status? |
| PATCH | /api/users/:id | 更新用户 | 同上字段均可选 |
| DELETE | /api/users/:id | 删除用户 | - |

## 4. RBAC 模块 /api/rbac

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/rbac/menu-catalog | 菜单权限目录 | - |
| GET | /api/rbac/roles | 角色列表 | - |
| POST | /api/rbac/roles | 创建角色 | id, name, description? |
| PATCH | /api/rbac/roles/:id | 更新角色基础信息 | name?, description? |
| PATCH | /api/rbac/roles/:id/permissions | 更新角色权限 | permissions |
| DELETE | /api/rbac/roles/:id | 删除角色 | - |

permissions 示例：
{"MENU_HOME":{"query":true,"operate":false}}

## 5. 数据源模块 /api/datasource

### 5.1 数据源

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/datasource | 数据源列表 | - |
| GET | /api/datasource/:id | 数据源详情 | - |
| POST | /api/datasource | 创建数据源 | name, type, host, port, database, username, password, schema?, description? |
| PATCH | /api/datasource/:id | 更新数据源 | 同上字段可选 |
| DELETE | /api/datasource/:id | 删除数据源 | - |
| POST | /api/datasource/:id/test | 测试连接 | - |

type 取值：POSTGRESQL, MYSQL, MSSQL

### 5.2 查询模板

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/datasource/query-templates/list?dataSourceId=xxx | 模板列表（可过滤） | - |
| GET | /api/datasource/query-templates/:id | 模板详情 | - |
| POST | /api/datasource/query-templates | 创建模板 | name, dataSourceId, sql, columns?, messageTemplate?, description? |
| PATCH | /api/datasource/query-templates/:id | 更新模板 | 同上字段可选 |
| DELETE | /api/datasource/query-templates/:id | 删除模板 | - |
| POST | /api/datasource/query-templates/:id/preview | 预览查询 | - |

columns 示例：
[{"field":"name","label":"名称","width":"180px"}]

## 6. 通知模块 /api/notify

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/notify/channels | 通道列表 | - |
| GET | /api/notify/channels/:id | 通道详情 | - |
| POST | /api/notify/channels | 创建通道 | name, type, configJson, description? |
| PATCH | /api/notify/channels/:id | 更新通道 | 同上字段可选 |
| DELETE | /api/notify/channels/:id | 删除通道 | - |
| POST | /api/notify/channels/:id/test | 测试发送 | - |

type 取值：EMAIL, DINGTALK, WECOM

## 7. 调度模块 /api/scheduler

| 方法 | 路径 | 说明 | 请求体字段 |
|---|---|---|---|
| GET | /api/scheduler/tasks | 任务列表 | - |
| GET | /api/scheduler/tasks/:id | 任务详情 | - |
| POST | /api/scheduler/tasks | 创建任务 | name, cronExpr, queryTemplateId, channelId, recipients, messageTitle? |
| PATCH | /api/scheduler/tasks/:id | 更新任务 | 同上字段可选 |
| DELETE | /api/scheduler/tasks/:id | 删除任务 | - |
| POST | /api/scheduler/tasks/:id/toggle | 启停切换 | - |
| POST | /api/scheduler/tasks/:id/run | 手动执行 | - |
| GET | /api/scheduler/tasks/:id/logs | 执行日志 | - |

## 8. 关键状态值

- DataSource.type: POSTGRESQL, MYSQL, MSSQL
- NotifyChannel.type: EMAIL, DINGTALK, WECOM
- ScheduledTask.status: ACTIVE, PAUSED
- ScheduledTask.lastRunStatus: SUCCESS, FAILED

## 9. 文档范围说明

本文件仅覆盖消息中心当前使用的 API 模块。
已从文档移除历史复制内容与当前系统无关的业务域接口说明。

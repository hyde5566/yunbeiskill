# 云贝Skill管理系统

## 项目结构

```
project1/
├── yunbei-skill-api/    # 后端 (NestJS)
├── yunbei-skill-web/    # 前端 (Vue3 + Ant Design)
└── README.md            # 本文档
```

## 环境要求

- Node.js v20+
- MySQL 8.0
- npm 或 pnpm

## 快速启动

### 1. 启动后端

```bash
cd yunbei-skill-api
npm install          # 首次需要安装依赖
npm run start:dev    # 开发模式启动
```

后端地址：
- API: http://localhost:3000
- Swagger文档: http://localhost:3000/api-docs

### 2. 启动前端

```bash
cd yunbei-skill-web
npm install          # 首次需要安装依赖
npm run dev          # 开发模式启动
```

前端地址：http://localhost:5173

### 3. 同时启动（需要两个终端）

终端1：
```bash
cd yunbei-skill-api && npm run start:dev
```

终端2：
```bash
cd yunbei-skill-web && npm run dev
```

## 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 系统管理员 |
| reviewer | reviewer123 | 审核员 |
| employee | employee123 | 员工 |

## 配置文件

### 后端配置 (yunbei-skill-api/.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的密码
DB_DATABASE=yunbei_skill

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### 前端代理配置 (yunbei-skill-web/vite.config.ts)

已配置 `/api` 代理到 `http://localhost:3000`

## 其他命令

### 后端

```bash
npm run build        # 编译构建
npm run start:prod   # 生产模式启动
npm run lint         # 代码检查
```

### 前端

```bash
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
```

## 数据库初始化

首次运行前需要创建数据库并导入初始数据：

```bash
mysql -u root -p -e "CREATE DATABASE yunbei_skill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p yunbei_skill < docs/init.sql  # 如有初始化脚本

---

## 系统架构

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue3 + Vite + Ant Design Vue + Pinia |
| 后端 | NestJS + TypeORM + Passport(JWT) |
| 数据库 | MySQL 8.0 |
| 文档 | Swagger |

### 后端模块架构

```
yunbei-skill-api/
├── src/
│   ├── main.ts                    # 入口文件
│   ├── app.module.ts              # 根模块
│   ├── config/                    # 配置
│   │   ├── database.config.ts     # 数据库配置
│   │   └── jwt.config.ts          # JWT配置
│   ├── common/                    # 公共模块
│   │   ├── decorators/            # 自定义装饰器
│   │   │   └── public.decorator.ts    # @Public() @RequirePermission()
│   │   ├── guards/                # 守卫
│   │   │   ├── jwt-auth.guard.ts      # JWT认证守卫
│   │   │   └── permission.guard.ts    # 权限守卫
│   │   ├── interceptors/          # 拦截器
│   │   │   └── response.interceptor.ts # 响应格式化
│   │   └── filters/               # 异常过滤器
│   │       └── http-exception.filter.ts
│   └── modules/                   # 业务模块
│       ├── auth/                  # 认证模块
│       ├── user/                  # 用户管理
│       ├── department/            # 部门管理
│       ├── permission/            # 权限管理
│       ├── project/               # 项目管理
│       ├── skill-category/        # Skill分类
│       ├── skill/                 # Skill核心模块
│       ├── download/              # 下载记录
│       ├── rating/                # 评分
│       ├── feedback/              # 反馈
│       ├── notification/          # 通知
│       ├── operation-log/         # 操作日志
│       ├── login-log/             # 登录日志
│       └── stats/                 # 统计分析
```

### 核心业务模块

| 模块 | 功能 | 主要实体 |
|------|------|----------|
| auth | 登录认证、JWT令牌 | - |
| user | 用户CRUD、权限查询 | User |
| department | 部门树形管理 | Department |
| permission | 权限分配 | Permission, UserPermission |
| project | 项目与成员管理 | Project |
| skill-category | Skill分类管理 | SkillCategory |
| skill | Skill入库、审核、版本管理 | Skill, SkillVersion, SkillVisibility |
| download | 下载记录、统计 | DownloadRecord |
| rating | 评分功能 | Rating |
| feedback | 反反馈功能 | Feedback |
| notification | 站内通知 | Notification |
| operation-log | 操作日志记录 | OperationLog |
| login-log | 登录日志记录 | LoginLog |
| stats | 数据统计、导出 | - |

### 前端架构

```
yunbei-skill-web/
├── src/
│   ├── main.ts              # 入口
│   ├── App.vue              # 根组件
│   ├── api/                 # API请求
│   │   ├── request.ts       # Axios封装
│   │   ├── auth.ts          # 认证API
│   │   └── ...
│   ├── components/          # 组件
│   │   ├── layout/          # 布局组件
│   │   │   └ AppLayout.vue
│   │   └ NotificationCenter.vue
│   ├── pages/               # 页面
│   │   ├── auth/            # 登录页
│   │   ├── dashboard/       # 首页
│   │   ├── skill/           # Skill相关
│   │   ├── admin/           # 管理后台
│   │   ├── user/            # 用户个人页
│   │   └── review/          # 审核页
│   ├── router/              # 路由
│   ├── stores/              # Pinia状态
│   ├── utils/               # 工具函数
│   └── types/               # 类型定义
```

### 前端页面模块

| 路径 | 页面 | 权限 |
|------|------|------|
| /login | 登录页 | 公开 |
| / | 首页仪表盘 | 登录 |
| /skill | Skill检索列表 | 登录 |
| /skill/submit | Skill提交 | 登录 |
| /skill/:id | Skill详情 | 登录 |
| /my-downloads | 我的下载历史 | 登录 |
| /my-submissions | 我的提交记录 | 登录 |
| /review | 审核管理 | review/admin |
| /admin/users | 用户管理 | admin |
| /admin/departments | 部门管理 | admin |
| /admin/permissions | 权限配置 | admin |
| /admin/projects | 项目管理 | admin |
| /admin/categories | 分类管理 | admin |
| /admin/logs | 操作日志 | admin |
| /admin/login-logs | 登录日志 | admin |
| /admin/stats | 数据统计 | admin |

### 认证与权限流程

```
用户登录 → JWT Token生成 → 前端存储Token
    ↓
请求API → JwtAuthGuard验证Token → 解析用户信息
    ↓
PermissionGuard → 检查用户权限 → 允许/拒绝访问
```

### 权限码说明

| 权限码 | 说明 |
|--------|------|
| basic | 基础权限，员工默认 |
| review | 审核权限 |
| admin | 系统管理员，拥有所有权限 |

### API响应格式

```json
{
  "code": 0,           // 0表示成功
  "message": "success",
  "data": { ... },     // 业务数据
  "timestamp": 1234567890
}
```

### 数据库ER关系

```
User ─┬─ belongsTo ── Department
      │
      └─ hasMany ─── UserPermission ── belongsTo ── Permission
      │
      └─ memberOf ── Project (多对多)

Skill ─┬─ belongsTo ── SkillCategory
       │
       ├─ belongsTo ── User (submitter)
       │
       ├─ hasMany ─── SkillVersion
       │
       ├─ hasMany ─── SkillVisibility ── target(project/account)
       │
       ├─ hasMany ─── DownloadRecord ── belongsTo ── User
       │
       ├─ hasMany ─── Rating ── belongsTo ── User
       │
       └─ hasMany ─── Feedback ── belongsTo ── User
```

---

## 与 pcodebuddy-glm5.1 的差异对比

### 目录结构差异

| 项目 | project1 (当前) | pcodebuddy-glm5.1 |
|------|-----------------|-------------------|
| 后端模块名 | `stats` | `statistics` |
| 审核模块 | 无独立review模块，集成在skill模块 | 有独立 `review` 模块 |
| 前端页面命名 | `SkillList.vue`, `SkillDetail.vue` | `SearchCenter.vue`, `Detail.vue` |
| 前端下载页 | `user/MyDownloads.vue` | `download/MyDownloads.vue` |

### 后端模块对比

**project1 (15模块)**
```
auth, department, download, feedback, login-log, notification,
operation-log, permission, project, rating, skill, skill-category,
stats, user
```

**pcodebuddy-glm5.1 (17模块)**
```
auth, department, download, feedback, login-log, notification,
operation-log, permission, project, rating, review, skill,
skill-category, statistics, user
```

### 前端页面对比

| 功能 | project1 | pcodebuddy-glm5.1 |
|------|----------|-------------------|
| Skill列表 | `skill/SkillList.vue` | `skill/SearchCenter.vue` |
| Skill详情 | `skill/SkillDetail.vue` | `skill/Detail.vue` |
| Skill提交 | `skill/SkillSubmit.vue` | `skill/Submit.vue` |
| 我的提交 | `user/MySubmissions.vue` | `skill/MySubmissions.vue` |
| 我的下载 | `user/MyDownloads.vue` | `download/MyDownloads.vue` |
| 审核列表 | `review/ReviewList.vue` | `review/PendingList.vue` |
| 审核详情 | 无 | `review/ReviewDetail.vue` |
| 反馈管理 | 无 | `admin/FeedbackManage.vue` |
| 项目成员 | 无独立页 | `admin/ProjectMembers.vue` |
| 通知列表 | 无独立页 | `notification/NotificationList.vue` |

### 功能差异

| 功能 | project1 | pcodebuddy-glm5.1 |
|------|----------|-------------------|
| Skill下架 | ✅ 有 | ❌ 无 |
| CSV导出 | ✅ 有 | ❌ 无 |
| 项目维度统计 | ✅ 有 | ❌ 无 |
| 用户维度统计 | ✅ 有 | ❌ 无 |
| 审核详情页 | ❌ 无 | ✅ 有 |
| 反馈管理页 | ❌ 无 | ✅ 有 |
| 项目成员管理页 | ❌ 无 | ✅ 有 |
| 独立通知列表页 | ❌ 无 | ✅ 有 |
| 通知中心组件 | ✅ 有 | ❌ 无 |

### 代码质量差异

| 方面 | project1 | pcodebuddy-glm5.1 |
|------|----------|-------------------|
| JWT payload标准化 | ✅ userId统一 | ⚠️ 可能不一致 |
| 删除关联检查 | ✅ 已修复 | ❌ 无检查 |
| TypeORM findByIds | ✅ 已改用In | ⚠️ 可能使用旧API |
| 文档说明 | ✅ README完整 | ❌ 默认NestJS模板 |

### 总结

- **project1**: 更注重功能完整性、数据导出、安全性修复
- **pcodebuddy-glm5.1**: 更注重页面细分、UI组件化
```
# 阶段一：基础框架实现计划

| 属性 | 内容 |
| --- | --- |
| 计划名称 | 云贝Skill管理系统 - 阶段一基础框架 |
| 版本号 | v1.0 |
| 创建时间 | 2026-04-12 |
| 状态 | 待执行 |

---

## 1. 阶段目标

搭建系统骨架，实现基础管理功能：

- **项目初始化**：前后端项目脚手架搭建
- **数据库**：执行DDL脚本，创建全部19张表
- **认证模块**：登录/登出/JWT验证
- **用户管理**：账号CRUD、密码修改
- **部门管理**：部门层级CRUD
- **权限配置**：三种权限分配给用户

**验收标准**：管理员可登录系统，管理账号、部门、权限。

---

## 2. 前端项目初始化

### 2.1 创建Vue3项目

```bash
# 使用Vite创建项目
cd D:/Project/yunbeiskill/project1
npm create vite@latest yunbei-skill-web -- --template vue-ts

cd yunbei-skill-web
npm install
```

### 2.2 安装依赖

```bash
# 核心依赖
npm install ant-design-vue@4.x pinia axios vue-router@4

# 开发依赖
npm install -D @types/node
```

### 2.3 项目结构

```
yunbei-skill-web/
├── src/
│   ├── api/              # API封装
│   │   ├── request.ts    # Axios实例+拦截器
│   │   ├── auth.ts       # 认证API
│   │   ├── user.ts       # 用户API
│   │   ├── department.ts # 部门API
│   │   └── permission.ts # 权限API
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   ├── layout/       # 布局组件
│   │   │   ├── AppLayout.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Header.vue
│   │   └── common/       # 通用组件
│   ├── pages/            # 页面组件
│   │   ├── auth/
│   │   │   └── Login.vue
│   │   ├── admin/
│   │   │   ├── UserList.vue
│   │   │   ├── DepartmentList.vue
│   │   │   └── PermissionConfig.vue
│   │   └── dashboard/
│   │   │   └── Index.vue
│   ├── router/           # 路由配置
│   │   ├── index.ts
│   │   └── routes.ts
│   ├── stores/           # Pinia状态管理
│   │   ├── auth.ts       # 登录状态+Token+用户信息
│   │   ├── permission.ts # 权限列表+菜单
│   │   └── app.ts        # 应用全局状态
│   ├── types/            # TypeScript类型定义
│   │   ├── user.ts
│   │   ├── department.ts
│   │   ├── permission.ts
│   │   └── api.ts
│   ├── utils/            # 工具函数
│   │   ├── storage.ts    # localStorage封装
│   │   └── message.ts    # 消息提示封装
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 2.4 关键文件实现

#### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

#### src/api/request.ts

```typescript
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message: msg, data } = response.data
    if (code === 0) {
      return data
    }
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
```

#### src/stores/auth.ts

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'
import { storage } from '@/utils/storage'

interface UserInfo {
  id: number
  username: string
  realName: string
  departmentId: number
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(storage.get('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 登录
  async function doLogin(username: string, password: string) {
    const res = await login({ username, password })
    token.value = res.token
    storage.set('token', res.token)
    await fetchUserInfo()
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    userInfo.value = await getUserInfo()
  }

  // 登出
  async function doLogout() {
    await logout()
    token.value = ''
    userInfo.value = null
    storage.remove('token')
  }

  // 检查权限
  function hasPermission(perm: string): boolean {
    return userInfo.value?.permissions?.includes(perm) || false
  }

  return {
    token,
    userInfo,
    doLogin,
    doLogout,
    fetchUserInfo,
    hasPermission
  }
})
```

---

## 3. 后端项目初始化

### 3.1 创建NestJS项目

```bash
cd D:/Project/yunbeiskill
npm i -g @nestjs/cli
nest new yunbei-skill-api

cd yunbei-skill-api
npm install
```

### 3.2 安装依赖

```bash
# 数据库相关
npm install @nestjs/typeorm typeorm mysql2

# 认证相关
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs

# 配置相关
npm install @nestjs/config

# 验证相关
npm install class-validator class-transformer

# Swagger文档
npm install @nestjs/swagger
```

### 3.3 项目结构

```
yunbei-skill-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── change-password.dto.ts
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   ├── department/
│   │   │   ├── department.module.ts
│   │   │   ├── department.controller.ts
│   │   │   ├── department.service.ts
│   │   │   ├── entities/
│   │   │   │   └── department.entity.ts
│   │   │   └── dto/
│   │   │   │   ├── create-dept.dto.ts
│   │   │   │   ├── update-dept.dto.ts
│   │   ├── permission/
│   │   │   ├── permission.module.ts
│   │   │   ├── permission.controller.ts
│   │   │   ├── permission.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── permission.entity.ts
│   │   │   │   └── user-permission.entity.ts
│   │   │   └── dto/
│   │   │   │   ├── assign-permissions.dto.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── require-permission.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permission.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── business-exception.filter.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── response.dto.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── app.config.ts
│   ├── entities/          # 全局实体定义
│   ├── app.module.ts
│   └── main.ts
├── test/
├── database/
│   └── init.sql           # DDL初始化脚本
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 3.4 关键文件实现

#### src/main.ts

```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))

  // 全局拦截器和过滤器
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  // CORS配置
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true
  })

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('云贝Skill管理系统API')
    .setDescription('API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3000)
}
bootstrap()
```

#### src/app.module.ts

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionGuard } from './common/guards/permission.guard'

import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { DepartmentModule } from './modules/department/department.module'
import { PermissionModule } from './modules/permission/permission.module'

import databaseConfig from './config/database.config'
import jwtConfig from './config/jwt.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 生产环境使用迁移
        logging: true
      })
    }),
    AuthModule,
    UserModule,
    DepartmentModule,
    PermissionModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard }
  ]
})
export class AppModule {}
```

#### src/common/decorators/require-permission.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common'

export const REQUIRE_PERMISSION_KEY = 'require_permission'

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions)
```

#### src/common/guards/permission.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/core'
import { Reflector } from '@nestjs/core'
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass]
    )

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.permissions) {
      throw new ForbiddenException('无权限访问')
    }

    const hasPermission = requiredPermissions.some(
      perm => user.permissions.includes(perm)
    )

    if (!hasPermission) {
      throw new ForbiddenException('无权限访问')
    }

    return true
  }
}
```

---

## 4. 数据库DDL脚本

### 4.1 初始化脚本 (database/init.sql)

```sql
-- 云贝Skill管理系统数据库初始化脚本
-- MySQL 8.0

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户组织相关表
-- ----------------------------

-- 部门表
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '部门名称',
  `parent_id` bigint DEFAULT NULL COMMENT '父部门ID',
  `level` int NOT NULL DEFAULT 1 COMMENT '层级（1=一级，2=二级...）',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 用户表
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '账号',
  `password` varchar(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `real_name` varchar(100) NOT NULL COMMENT '真实姓名',
  `department_id` bigint NOT NULL COMMENT '所属部门ID',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态（1=正常，0=禁用）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_department_id` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 权限定义表
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '权限代码（basic/review/admin）',
  `name` varchar(100) NOT NULL COMMENT '权限名称',
  `description` varchar(255) DEFAULT NULL COMMENT '权限描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限定义表';

-- 用户权限关联表
CREATE TABLE `user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_permission` (`user_id`, `permission_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限关联表';

-- ----------------------------
-- 2. Skill核心表
-- ----------------------------

-- Skill分类表（预设7个分类）
CREATE TABLE `skill_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `description` varchar(255) DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill分类表';

-- 预设分类数据
INSERT INTO `skill_categories` (`name`, `description`, `sort_order`) VALUES
('开发工具', '开发辅助工具', 1),
('数据分析', '数据处理和分析工具', 2),
('文档处理', '文档生成和转换工具', 3),
('自动化脚本', '自动化执行脚本', 4),
('API服务', 'API接口相关', 5),
('测试工具', '测试辅助工具', 6),
('其他', '其他类型Skill', 7);

-- Skill基本信息表
CREATE TABLE `skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(100) NOT NULL COMMENT 'Skill唯一标识（UUID）',
  `name` varchar(200) NOT NULL COMMENT 'Skill名称',
  `description` text COMMENT 'Skill描述',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `source_type` varchar(50) NOT NULL COMMENT '来源类型（internal/external）',
  `source_name` varchar(200) DEFAULT NULL COMMENT '来源名称',
  `submitter_id` bigint NOT NULL COMMENT '提交人ID',
  `status` varchar(50) NOT NULL DEFAULT 'pending_review' COMMENT '状态',
  `visibility_type` varchar(50) NOT NULL DEFAULT 'all' COMMENT '可见范围类型',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_unique_id` (`unique_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_submitter_id` (`submitter_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill基本信息表';

-- Skill版本记录表
CREATE TABLE `skill_versions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_number` varchar(50) NOT NULL COMMENT '版本号（如v1.0）',
  `zip_path` varchar(500) NOT NULL COMMENT 'OSS存储路径',
  `zip_size` bigint NOT NULL COMMENT '文件大小（字节）',
  `change_log` text COMMENT '更新日志',
  `uploader_id` bigint NOT NULL COMMENT '上传人ID',
  `status` varchar(50) NOT NULL DEFAULT 'pending_review' COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill版本记录表';

-- Skill可见范围设置表
CREATE TABLE `skill_visibility` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `target_type` varchar(50) NOT NULL COMMENT '目标类型（project/account）',
  `target_id` bigint NOT NULL COMMENT '目标ID（项目ID或用户ID）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Skill可见范围设置表';

-- ----------------------------
-- 3. 流程记录表
-- ----------------------------

-- 审核记录表
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint NOT NULL COMMENT '版本ID',
  `reviewer_id` bigint NOT NULL COMMENT '审核人ID',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  `status` varchar(50) NOT NULL COMMENT '状态（pending/approved/rejected）',
  `comment` text COMMENT '审核意见',
  `reviewed_at` datetime DEFAULT NULL COMMENT '审核时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核记录表';

-- 下载记录表
CREATE TABLE `download_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '下载人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint NOT NULL COMMENT '版本ID',
  `department_id` bigint NOT NULL COMMENT '下载人所属部门ID',
  `downloaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下载时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_version_id` (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='下载记录表';

-- 评分记录表
CREATE TABLE `ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '评分人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID（可空）',
  `score` int NOT NULL COMMENT '评分（1-5）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分记录表';

-- 反馈记录表
CREATE TABLE `feedbacks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '反馈人ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID',
  `content` text NOT NULL COMMENT '反馈内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈记录表';

-- ----------------------------
-- 4. 项目组织表
-- ----------------------------

-- 项目表
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `description` text COMMENT '项目描述',
  `owner_id` bigint NOT NULL COMMENT '项目负责人ID',
  `status` varchar(50) NOT NULL DEFAULT 'active' COMMENT '状态（active/archived）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 项目成员表
CREATE TABLE `project_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role` varchar(50) NOT NULL DEFAULT 'member' COMMENT '角色（owner/member）',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_user` (`project_id`, `user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表';

-- 项目关联Skill表
CREATE TABLE `project_skills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `skill_id` bigint NOT NULL COMMENT 'SkillID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_skill` (`project_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目关联Skill表';

-- ----------------------------
-- 5. 系统记录表
-- ----------------------------

-- 站内通知表
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '接收人ID',
  `type` varchar(50) NOT NULL COMMENT '通知类型',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `related_skill_id` bigint DEFAULT NULL COMMENT '关联SkillID',
  `related_version_id` bigint DEFAULT NULL COMMENT '关联版本ID',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内通知表';

-- 操作日志表
CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '操作人ID',
  `module` varchar(100) NOT NULL COMMENT '模块',
  `action` varchar(100) NOT NULL COMMENT '动作',
  `target_type` varchar(100) DEFAULT NULL COMMENT '目标类型',
  `target_id` bigint DEFAULT NULL COMMENT '目标ID',
  `detail` text COMMENT '操作详情',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE `login_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '账号',
  `login_type` varchar(50) NOT NULL COMMENT '类型（login/logout）',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `device` varchar(255) DEFAULT NULL COMMENT '设备信息',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态（1=成功，0=失败）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- ----------------------------
-- 6. 初始化权限数据
-- ----------------------------

INSERT INTO `permissions` (`code`, `name`, `description`) VALUES
('basic', '基础权限', '搜索、下载、提交、评分反馈'),
('review', '审核权限', '审核流程操作、批准/驳回'),
('admin', '管理权限', '系统管理、全局统计、导出');

-- ----------------------------
-- 7. 初始化管理员账号
-- ----------------------------

-- 先创建一个顶级部门
INSERT INTO `departments` (`name`, `level`) VALUES ('云贝科技', 1);

-- 创建管理员账号（密码：admin123，bcrypt加密后的值）
-- bcrypt hash生成：await bcrypt.hash('admin123', 10)
INSERT INTO `users` (`username`, `password`, `real_name`, `department_id`, `status`) VALUES
('admin', '$2b$10$placeholder_hash_here', '系统管理员', 1, 1);

-- 给管理员分配全部权限
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3);

SET FOREIGN_KEY_CHECKS = 1;
```

**注意**：实际执行时需要用bcrypt生成真实密码哈希。

---

## 5. 认证模块实现

### 5.1 auth.service.ts

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByUsername(loginDto.username)
    if (!user) {
      throw new UnauthorizedException('账号不存在')
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误')
    }

    // 获取用户权限
    const permissions = await this.userService.getUserPermissions(user.id)

    const payload = {
      sub: user.id,
      username: user.username,
      permissions
    }

    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        departmentId: user.departmentId,
        permissions
      }
    }
  }

  async getUserInfo(userId: number) {
    const user = await this.userService.findById(userId)
    const permissions = await this.userService.getUserPermissions(userId)
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      departmentId: user.departmentId,
      permissions
    }
  }
}
```

### 5.2 jwt.strategy.ts

```typescript
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secret')
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      permissions: payload.permissions
    }
  }
}
```

### 5.3 auth.controller.ts

```typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getUserInfo(@Request() req) {
    return this.authService.getUserInfo(req.user.id)
  }
}
```

---

## 6. 用户管理模块实现

### 6.1 user.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Department } from '../department/entities/department.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 50, unique: true })
  username: string

  @Column({ length: 255 })
  password: string

  @Column({ length: 100, name: 'real_name' })
  realName: string

  @Column({ name: 'department_id' })
  departmentId: number

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @Column({ length: 100, nullable: true })
  email: string

  @Column({ length: 20, nullable: true })
  phone: string

  @Column({ type: 'tinyint', default: 1 })
  status: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
```

### 6.2 user.service.ts

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } })
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword
    })
    return this.userRepo.save(user)
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10)
    }
    Object.assign(user, dto)
    return this.userRepo.save(user)
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const result = await this.userRepo.query(
      `SELECT p.code FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = ?`,
      [userId]
    )
    return result.map(r => r.code)
  }

  async list(page: number, pageSize: number, filters: any) {
    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'dept')

    if (filters.departmentId) {
      qb.where('user.departmentId = :deptId', { deptId: filters.departmentId })
    }
    if (filters.status) {
      qb.andWhere('user.status = :status', { status: filters.status })
    }
    if (filters.keyword) {
      qb.andWhere('user.realName LIKE :keyword OR user.username LIKE :keyword',
        { keyword: `%${filters.keyword}%` })
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }
}
```

---

## 7. 部门管理模块实现

### 7.1 department.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 100 })
  name: string

  @Column({ name: 'parent_id', nullable: true })
  parentId: number

  @Column({ default: 1 })
  level: number

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
```

### 7.2 department.service.ts

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from './entities/department.entity'
import { CreateDeptDto } from './dto/create-dept.dto'

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private deptRepo: Repository<Department>
  ) {}

  async create(dto: CreateDeptDto): Promise<Department> {
    let level = 1
    if (dto.parentId) {
      const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } })
      if (parent) level = parent.level + 1
    }
    const dept = this.deptRepo.create({ ...dto, level })
    return this.deptRepo.save(dept)
  }

  async getTree(): Promise<Department[]> {
    const all = await this.deptRepo.find({ order: { sortOrder: 'ASC' } })
    return this.buildTree(all, null)
  }

  private buildTree(items: Department[], parentId: number | null): Department[] {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: this.buildTree(items, item.id)
      }))
  }
}
```

---

## 8. 权限配置模块实现

### 8.1 permission.service.ts

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from './entities/permission.entity'
import { UserPermission } from './entities/user-permission.entity'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>
  ) {}

  async getAll(): Promise<Permission[]> {
    return this.permRepo.find()
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userPerms = await this.userPermRepo.find({ where: { userId } })
    const permIds = userPerms.map(up => up.permissionId)
    return this.permRepo.findByIds(permIds)
  }

  async assignToUser(dto: AssignPermissionsDto): Promise<void> {
    // 先删除现有权限
    await this.userPermRepo.delete({ userId: dto.userId })

    // 再分配新权限
    const userPerms = dto.permissionIds.map(pid =>
      this.userPermRepo.create({
        userId: dto.userId,
        permissionId: pid,
        assignedBy: dto.assignedBy
      })
    )
    await this.userPermRepo.save(userPerms)
  }
}
```

---

## 9. 执行步骤清单

### 步骤1：创建项目目录结构

```bash
# 创建前后端项目目录
mkdir -p yunbei-skill-web yunbei-skill-api
```

### 步骤2：初始化前端项目

1. 执行 `npm create vite@latest yunbei-skill-web -- --template vue-ts`
2. 安装依赖：ant-design-vue、pinia、axios、vue-router
3. 创建项目结构目录
4. 编写核心文件：request.ts、auth.ts store、AppLayout.vue

### 步骤3：初始化后端项目

1. 执行 `nest new yunbei-skill-api`
2. 安装依赖：typeorm、mysql2、jwt、passport、config
3. 创建项目结构目录
4. 编写核心文件：main.ts、app.module.ts、guards、decorators

### 步骤4：执行数据库DDL

1. 创建数据库 `yunbei_skill`
2. 执行 `database/init.sql` 脚本
3. 使用bcrypt生成管理员密码哈希，更新users表

### 步骤5：实现认证模块

1. 创建 auth.module.ts、auth.service.ts、auth.controller.ts
2. 实现 JWT Strategy
3. 编写 LoginDto 和 ChangePasswordDto

### 步骤6：实现用户管理模块

1. 创建 user.entity.ts
2. 实现 user.service.ts（CRUD + 权限查询）
3. 实现 user.controller.ts（增删改查API）

### 步骤7：实现部门管理模块

1. 创建 department.entity.ts
2. 实现 department.service.ts（树形结构）
3. 实现 department.controller.ts

### 步骤8：实现权限配置模块

1. 创建 permission.entity.ts、user-permission.entity.ts
2. 实现 permission.service.ts（权限分配）
3. 实现 permission.controller.ts

### 步骤9：启动测试

1. 启动后端：`cd yunbei-skill-api && npm run start:dev`
2. 启动前端：`cd yunbei-skill-web && npm run dev`
3. 测试登录功能（admin / admin123）
4. 测试用户/部门/权限管理功能

---

## 10. 验收清单

| 功能 | 验收标准 | 状态 |
| --- | --- | --- |
| 前端启动 | 访问 localhost:5173 显示登录页 | 待验证 |
| 后端启动 | 访问 localhost:3000/api-docs 显示Swagger | 待验证 |
| 数据库 | 19张表全部创建成功 | 待验证 |
| 登录 | admin/admin123 登录成功返回Token | 待验证 |
| 用户列表 | 管理员可查看用户列表 | 待验证 |
| 创建用户 | 管理员可创建新用户账号 | 待验证 |
| 部门树形 | 显示部门层级结构 | 待验证 |
| 权限分配 | 可给用户分配basic/review/admin权限 | 待验证 |
| 权限控制 | 无权限用户访问管理接口返回403 | 待验证 |

---

## 11. 后续阶段

阶段一完成后，推进阶段二：

- **阶段二**：Skill入库 + 版本管理 + 审核 + 检索 + 下载
- **阶段三**：评分反馈 + 通知 + 统计 + 日志

---

**计划文档编写完成，待用户确认后开始执行。**
# 云贝科技 Skill 库管理技术方案

## 文档信息

| 项目名称 | 云贝科技 Skill 库管理 |
| --- | --- |
| 文档版本 | v1.2 |
| 创建日期 | 2026-04-05 |
| 更新日期 | 2026-04-05 |
| 关联PRD | skill-management-library-prd.md |

---

## 1. 系统架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
├─────────────────────────────────────────────────────────────────┤
│   Web 管理端 (Vue3)    │    H5 移动端 (Vue3)    │    文件存储     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         网关层 (Nginx)                           │
│   - 静态资源代理                                                  │
│   - API 路由转发                                                  │
│   - 负载均衡                                                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      应用服务层 (Spring Boot)                     │
├─────────────────────────────────────────────────────────────────┤
│  认证服务  │  用户服务  │  组织服务  │  Skill服务  │  文件服务    │
│  通知服务  │  日志服务  │  统计服务  │  审核服务   │  权限服务    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据层                                    │
├─────────────────────────────────────────────────────────────────┤
│   MySQL (主数据)    │    文件存储 (MinIO/本地)    │    缓存 (Redis)  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 模块划分

| 模块名称 | 职责 | 核心功能 |
| --- | --- | --- |
| 认证服务 | 用户认证与会话管理 | 登录、登出、密码管理、登录态校验 |
| 用户服务 | 用户账号管理 | 账号CRUD、角色分配、密码修改 |
| 组织服务 | 组织架构管理 | 部门管理、项目管理、部门负责人设置 |
| Skill服务 | Skill核心业务 | Skill提交、审核、版本管理、生命周期管理 |
| 文件服务 | 文件上传下载 | 文件上传、下载、存储管理 |
| 通知服务 | 消息通知 | 站内信发送、已读未读管理 |
| 日志服务 | 操作日志 | 操作日志记录、查询、导出 |
| 统计服务 | 数据统计 | 下载统计、评分统计、审核统计 |
| 权限服务 | 权限控制 | 数据权限、功能权限、授权申请审批 |

---

## 2. 技术选型

### 2.1 后端技术栈

| 层次 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 核心框架 | Spring Boot | 3.2.x | 主框架 |
| 安全框架 | Spring Security | 6.x | 认证授权 |
| ORM框架 | MyBatis-Plus | 3.5.x | 数据访问 |
| 数据库连接池 | HikariCP | 5.x | 连接池管理 |
| 缓存 | Redis | 7.x | 会话缓存、数据缓存 |
| 文件存储 | 本地存储 | - | 文件存储（可选MinIO） |
| API文档 | Knife4j | 4.x | 接口文档生成 |
| 日志框架 | Logback | 1.4.x | 日志记录 |
| 工具类 | Hutool | 5.x | 常用工具封装 |

### 2.2 前端技术栈

| 层次 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 核心框架 | Vue | 3.4.x | 前端框架 |
| UI组件库 | Naive UI | 2.x | UI组件，TypeScript优先 |
| 状态管理 | Pinia | 2.x | 状态管理 |
| 路由 | Vue Router | 4.x | 路由管理 |
| HTTP客户端 | Axios | 1.x | HTTP请求 |
| 构建工具 | Vite | 5.x | 构建打包 |
| 代码规范 | ESLint + Prettier | 最新版 | 代码检查 |

### 2.3 数据库

| 类型 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 关系型数据库 | MySQL | 8.0.x | 主数据存储 |
| 缓存 | Redis | 7.x | 会话、缓存 |

### 2.4 部署与运维

| 类型 | 技术 | 说明 |
| --- | --- | --- |
| 反向代理 | Nginx | 静态资源、反向代理、负载均衡 |
| 文件存储 | 本地存储/MinIO | 文件存储，优先本地存储 |
| 进程管理 | Systemd/JAR | 后端服务管理 |

---

## 3. 数据库设计

### 3.1 ER图概览

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    user      │     │  department  │     │   project    │
│   (用户表)    │     │   (部门表)    │     │   (项目表)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  user_dept   │     │  dept_skill  │     │project_member│
│ (用户部门关系)│     │(部门skill关系)│     │(项目成员关系) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │    skill     │
                   │  (skill表)   │
                   └──────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │skill_version │ │skill_comment │ │download_log  │
   │ (版本表)     │ │  (评论表)    │ │  (下载日志)  │
   └──────────────┘ └──────────────┘ └──────────────┘
```

### 3.2 核心数据表设计

#### 3.2.1 用户表 (sys_user)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| name | VARCHAR | 50 | 是 | 姓名 |
| emp_no | VARCHAR | 50 | 是 | 工号，唯一 |
| phone | VARCHAR | 20 | 是 | 手机号，唯一 |
| email | VARCHAR | 100 | 否 | 邮箱 |
| password | VARCHAR | 255 | 是 | 密码（加密） |
| dept_id | BIGINT | - | 是 | 所属部门ID |
| role | TINYINT | - | 是 | 角色：1使用者/2开发者/3管理员 |
| status | TINYINT | - | 是 | 状态：1启用/0停用 |
| login_fail_count | TINYINT | - | 是 | 登录失败次数，默认0 |
| lock_time | DATETIME | - | 否 | 账号锁定时间 |
| created_by | BIGINT | - | 是 | 创建人ID |
| created_time | DATETIME | - | 是 | 创建时间 |
| updated_time | DATETIME | - | 是 | 更新时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_emp_no (emp_no)
- UNIQUE KEY uk_phone (phone)
- INDEX idx_dept_id (dept_id)
- INDEX idx_status (status)

#### 3.2.2 部门表 (sys_department)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| name | VARCHAR | 100 | 是 | 部门名称 |
| code | VARCHAR | 50 | 是 | 部门编码，唯一 |
| parent_id | BIGINT | - | 否 | 上级部门ID |
| leader_id | BIGINT | - | 否 | 部门负责人ID |
| level | TINYINT | - | 是 | 层级：1-5 |
| sort | INT | - | 是 | 排序号 |
| description | VARCHAR | 500 | 否 | 部门描述 |
| created_time | DATETIME | - | 是 | 创建时间 |
| updated_time | DATETIME | - | 是 | 更新时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_code (code)
- INDEX idx_parent_id (parent_id)
- INDEX idx_level (level)

#### 3.2.3 项目表 (sys_project)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| name | VARCHAR | 100 | 是 | 项目名称 |
| code | VARCHAR | 50 | 是 | 项目编码，唯一 |
| description | VARCHAR | 500 | 否 | 项目描述 |
| created_time | DATETIME | - | 是 | 创建时间 |
| updated_time | DATETIME | - | 是 | 更新时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_code (code)

#### 3.2.4 项目成员表 (sys_project_member)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| project_id | BIGINT | - | 是 | 项目ID |
| user_id | BIGINT | - | 是 | 用户ID |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_project_user (project_id, user_id)
- INDEX idx_user_id (user_id)

#### 3.2.5 Skill表 (skill_info)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| name | VARCHAR | 100 | 是 | Skill名称，唯一 |
| description | VARCHAR | 500 | 是 | 描述 |
| type | TINYINT | - | 是 | 类型：1工作流辅助/2代码模板/3规范文档/4外部系统集成 |
| dept_id | BIGINT | - | 是 | 归属部门ID |
| source_type | TINYINT | - | 是 | 来源类型：1个人原创/2同事贡献/3第三方渠道 |
| source_desc | VARCHAR | 100 | 是 | 来源说明 |
| source_link | VARCHAR | 500 | 否 | 来源链接 |
| tutorial_url | VARCHAR | 500 | 否 | 使用教程链接 |
| detail_desc | TEXT | - | 否 | 详细说明 |
| status | TINYINT | - | 是 | 状态：0待审核/1已通过/2已拒绝/3已下架 |
| visibility | TINYINT | - | 是 | 可见性：0全员/1部门/2项目 |
| need_auth | TINYINT | - | 是 | 是否需要授权：0否/1是 |
| auth_approver_id | BIGINT | - | 否 | 审批人ID |
| is_featured | TINYINT | - | 是 | 是否精选：0否/1是 |
| current_version | VARCHAR | 20 | 是 | 当前版本号 |
| download_count | INT | - | 是 | 下载次数 |
| avg_rating | DECIMAL | 3,2 | 是 | 平均评分 |
| rating_count | INT | - | 是 | 评分人数 |
| creator_id | BIGINT | - | 是 | 创建人ID |
| created_time | DATETIME | - | 是 | 创建时间 |
| updated_time | DATETIME | - | 是 | 更新时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_name (name)
- INDEX idx_dept_id (dept_id)
- INDEX idx_type (type)
- INDEX idx_status (status)
- INDEX idx_creator_id (creator_id)
- INDEX idx_created_time (created_time)
- INDEX idx_download_count (download_count)
- INDEX idx_avg_rating (avg_rating)
- INDEX idx_is_featured (is_featured)

#### 3.2.6 Skill版本表 (skill_version)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| version | VARCHAR | 20 | 是 | 版本号 |
| change_log | VARCHAR | 1000 | 是 | 变更说明 |
| file_path | VARCHAR | 500 | 是 | 文件存储路径 |
| file_size | BIGINT | - | 是 | 文件大小(字节) |
| status | TINYINT | - | 是 | 状态：1正常/0已删除 |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_skill_version (skill_id, version)
- INDEX idx_skill_id (skill_id)

#### 3.2.7 Skill标签关联表 (skill_tag_relation)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| tag_id | BIGINT | - | 是 | 标签ID |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_skill_tag (skill_id, tag_id)
- INDEX idx_tag_id (tag_id)

#### 3.2.8 标签表 (skill_tag)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| name | VARCHAR | 50 | 是 | 标签名称，唯一 |
| created_time | DATETIME | - | 是 | 创建时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_name (name)

#### 3.2.9 Skill截图表 (skill_screenshot)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| file_path | VARCHAR | 500 | 是 | 文件存储路径 |
| sort | INT | - | 是 | 排序号 |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_skill_id (skill_id)

#### 3.2.10 Skill项目关联表 (skill_project_relation)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| project_id | BIGINT | - | 是 | 项目ID |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- UNIQUE KEY uk_skill_project (skill_id, project_id)
- INDEX idx_project_id (project_id)

#### 3.2.11 评论表 (skill_comment)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| version | VARCHAR | 20 | 是 | 关联版本号 |
| user_id | BIGINT | - | 是 | 评论用户ID |
| content | VARCHAR | 1000 | 是 | 评论内容 |
| rating | TINYINT | - | 是 | 评分：1-5 |
| parent_id | BIGINT | - | 否 | 父评论ID（回复） |
| is_edited | TINYINT | - | 是 | 是否已编辑：0否/1是 |
| created_time | DATETIME | - | 是 | 创建时间 |
| updated_time | DATETIME | - | 是 | 更新时间 |
| is_deleted | TINYINT | - | 是 | 是否删除：0否/1是 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_skill_id (skill_id)
- INDEX idx_user_id (user_id)
- INDEX idx_created_time (created_time)

#### 3.2.12 下载日志表 (log_download)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| version | VARCHAR | 20 | 是 | 版本号 |
| user_id | BIGINT | - | 是 | 下载用户ID |
| created_time | DATETIME | - | 是 | 下载时间 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_skill_id (skill_id)
- INDEX idx_user_id (user_id)
- INDEX idx_created_time (created_time)

#### 3.2.13 操作日志表 (log_operation)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| user_id | BIGINT | - | 是 | 操作用户ID |
| module | VARCHAR | 50 | 是 | 模块名称 |
| action | VARCHAR | 50 | 是 | 操作类型 |
| target_type | VARCHAR | 50 | 是 | 操作对象类型 |
| target_id | BIGINT | - | 否 | 操作对象ID |
| detail | VARCHAR | 1000 | 否 | 操作详情 |
| ip | VARCHAR | 50 | 否 | 操作IP |
| created_time | DATETIME | - | 是 | 操作时间 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_user_id (user_id)
- INDEX idx_module (module)
- INDEX idx_created_time (created_time)

#### 3.2.14 站内信表 (sys_notification)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| user_id | BIGINT | - | 是 | 接收用户ID |
| title | VARCHAR | 100 | 是 | 标题 |
| content | VARCHAR | 500 | 是 | 内容 |
| type | VARCHAR | 50 | 是 | 通知类型 |
| is_read | TINYINT | - | 是 | 是否已读：0否/1是 |
| created_time | DATETIME | - | 是 | 创建时间 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_user_id (user_id)
- INDEX idx_is_read (is_read)
- INDEX idx_created_time (created_time)

#### 3.2.15 授权申请表 (skill_auth_request)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | BIGINT | - | 是 | 主键ID |
| skill_id | BIGINT | - | 是 | Skill ID |
| user_id | BIGINT | - | 是 | 申请人ID |
| reason | VARCHAR | 500 | 否 | 申请原因 |
| status | TINYINT | - | 是 | 状态：0待审批/1已通过/2已拒绝 |
| approver_id | BIGINT | - | 否 | 审批人ID |
| reject_reason | VARCHAR | 500 | 否 | 拒绝原因 |
| created_time | DATETIME | - | 是 | 申请时间 |
| updated_time | DATETIME | - | 否 | 审批时间 |

**索引设计**：
- PRIMARY KEY (id)
- INDEX idx_skill_id (skill_id)
- INDEX idx_user_id (user_id)
- INDEX idx_status (status)

---

## 4. 接口设计概要

### 4.1 接口规范

#### 4.1.1 URL规范

- 基础路径：`/api/v1`
- 资源命名：小写复数形式，如 `/users`, `/skills`
- 操作命名：RESTful风格，使用HTTP方法表示操作

#### 4.1.2 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1712304000000
}
```

#### 4.1.3 分页请求格式

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "total": 100,
  "list": []
}
```

### 4.2 核心接口清单

#### 4.2.1 认证模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | /auth/login | 登录 |
| POST | /auth/logout | 登出 |
| PUT | /auth/password | 修改密码 |
| GET | /auth/info | 获取当前用户信息 |

#### 4.2.2 用户管理模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /users | 用户列表 |
| POST | /users | 新增用户 |
| PUT | /users/{id} | 编辑用户 |
| DELETE | /users/{id} | 删除用户 |
| PUT | /users/{id}/status | 启用/停用用户 |

#### 4.2.3 组织管理模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /departments | 部门树 |
| GET | /departments/{id} | 部门详情 |
| POST | /departments | 新增部门 |
| PUT | /departments/{id} | 编辑部门 |
| DELETE | /departments/{id} | 删除部门 |
| GET | /projects | 项目列表 |
| POST | /projects | 新增项目 |
| PUT | /projects/{id} | 编辑项目 |
| DELETE | /projects/{id} | 删除项目 |
| PUT | /projects/{id}/members | 管理项目成员 |

#### 4.2.4 Skill管理模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /skills | Skill列表 |
| GET | /skills/{id} | Skill详情 |
| POST | /skills | 提交Skill |
| PUT | /skills/{id} | 编辑Skill |
| DELETE | /skills/{id} | 删除Skill |
| PUT | /skills/{id}/status | 上架/下架 |
| PUT | /skills/{id}/featured | 设置/取消精选 |
| GET | /skills/{id}/versions | 版本历史 |
| POST | /skills/{id}/versions | 发布新版本 |
| GET | /skills/{id}/download | 下载Skill |
| GET | /skills/{id}/comments | 评论列表 |
| POST | /skills/{id}/comments | 发表评论 |
| PUT | /skills/{id}/comments/{commentId} | 编辑评论 |
| DELETE | /skills/{id}/comments/{commentId} | 删除评论 |
| POST | /skills/{id}/comments/{commentId}/reply | 回复评论 |
| PUT | /skills/{id}/rating | 评分 |
| GET | /skills/hot | 热门Skill（30天下载Top10） |
| GET | /skills/recommended | 推荐Skill（精选） |
| GET | /skills/mine | 我提交的Skill |

#### 4.2.5 标签管理模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /tags | 标签列表 |
| POST | /tags | 新增标签 |
| PUT | /tags/{id} | 编辑标签 |
| DELETE | /tags/{id} | 删除标签 |

#### 4.2.6 审核模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /reviews | 审核列表 |
| PUT | /reviews/{id}/approve | 通过审核 |
| PUT | /reviews/{id}/reject | 拒绝审核 |

#### 4.2.7 授权申请模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /auth-requests | 授权申请列表 |
| POST | /auth-requests | 申请授权 |
| GET | /auth-requests/pending | 待审批列表（审批人视角） |
| PUT | /auth-requests/{id}/approve | 通过授权申请 |
| PUT | /auth-requests/{id}/reject | 拒绝授权申请 |

#### 4.2.8 文件模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | /files/upload | 文件上传 |
| GET | /files/download/{id} | 文件下载 |

#### 4.2.9 通知模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /notifications | 通知列表 |
| PUT | /notifications/{id}/read | 标记已读 |
| PUT | /notifications/read-all | 全部已读 |

#### 4.2.10 日志模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /logs/operation | 操作日志 |
| GET | /logs/download | 下载日志 |
| GET | /logs/download/history | 个人下载历史 |
| GET | /logs/export | 导出日志 |

#### 4.2.11 统计报表模块

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /statistics/skill | Skill统计（下载量、评分分布、排行榜） |
| GET | /statistics/review | 审核统计（通过率、平均审核时长） |

---

## 5. 安全设计

### 5.1 认证与授权

| 项目 | 方案 |
| --- | --- |
| 认证方式 | JWT Token |
| Token存储 | Redis（支持主动失效） |
| Token有效期 | 7天 |
| 刷新机制 | Token过期前可刷新 |
| 密码加密 | BCrypt |

**登录失败锁定机制**：
- 用户表记录登录失败次数（login_fail_count）和锁定时间（lock_time）
- 登录失败时，失败次数 +1
- 连续失败 5 次后，账号锁定 30 分钟
- 锁定期间登录提示"账号已锁定，请 X 分钟后重试"
- 登录成功后，清零失败次数
- 管理员可手动解锁账号

**单设备登录机制**：
- Redis 以 `user:token:{userId}` 为 key 存储 tokenId
- 登录成功时生成新的 tokenId 并存入 Redis
- 每次请求校验 Token 中的 tokenId 与 Redis 中存储的是否一致
- 不一致则说明已在其他设备登录，提示"账号已在其他设备登录"
- Token 有效期 7 天，存储于 Redis 中

### 5.2 权限控制

| 层级 | 控制方式 |
| --- | --- |
| 接口权限 | Spring Security + 自定义注解 |
| 数据权限 | MyBatis拦截器 + 数据权限过滤器 |
| 按钮权限 | 前端v-auth指令 |

### 5.3 安全防护

| 风险 | 防护措施 |
| --- | --- |
| XSS攻击 | 输入过滤、输出编码 |
| CSRF攻击 | Token校验 |
| SQL注入 | MyBatis参数绑定 |
| 文件上传 | 文件类型校验、大小限制、重命名 |
| 敏感数据 | 密码加密、手机号脱敏 |
| 接口限流 | 基于IP的请求频率限制 |

---

## 6. 部署方案

### 6.1 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                                │
│   - 静态资源托管 (前端 dist)                                  │
│   - API 反向代理 (/api -> localhost:8080)                    │
│   - 文件下载代理 (/files -> 文件存储目录)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot Application                     │
│                  (java -jar skill-backend.jar)               │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   MySQL     │    │    Redis    │    │  文件存储    │
    │   (数据)    │    │   (缓存)    │    │  (本地磁盘)  │
    └─────────────┘    └─────────────┘    └─────────────┘
```

### 6.2 部署步骤

#### 6.2.1 环境准备

```bash
# 安装 JDK 17
yum install java-17-openjdk java-17-openjdk-devel

# 安装 MySQL 8.0
yum install mysql-server

# 安装 Redis
yum install redis

# 安装 Nginx
yum install nginx
```

#### 6.2.2 后端部署

```bash
# 上传 JAR 包
scp skill-backend.jar user@server:/opt/skill/

# 创建 systemd 服务
cat > /etc/systemd/system/skill-backend.service << EOF
[Unit]
Description=Skill Backend Service
After=syslog.target network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/skill
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar /opt/skill/skill-backend.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl start skill-backend
systemctl enable skill-backend
```

#### 6.2.3 前端部署

```bash
# 上传前端构建产物
scp -r dist/* user@server:/var/www/skill/

# Nginx 配置
cat > /etc/nginx/conf.d/skill.conf << EOF
server {
    listen 80;
    server_name skill.yunbei.com;

    # 前端静态资源
    location / {
        root /var/www/skill;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # 文件下载
    location /files/ {
        alias /opt/skill/files/;
        autoindex off;
    }
}
EOF

# 重载 Nginx
nginx -s reload
```

### 6.3 服务器配置建议

| 环境 | CPU | 内存 | 存储 | 数量 |
| --- | --- | --- | --- | --- |
| 测试环境 | 2核 | 4GB | 50GB | 1台 |
| 生产环境 | 4核 | 8GB | 200GB | 1台 |

### 6.4 备份策略

| 备份项 | 频率 | 保留周期 |
| --- | --- | --- |
| MySQL 数据库 | 每日凌晨 | 30天 |
| 上传文件 | 每周 | 永久 |
| 应用日志 | 每周归档 | 90天 |

---

## 7. 开发排期

### 7.1 里程碑

| 阶段 | 内容 | 工期 |
| --- | --- | --- |
| 第一阶段 | 基础框架搭建、数据库设计、认证模块 | 1周 |
| 第二阶段 | 用户管理、组织管理、权限管理 | 1.5周 |
| 第三阶段 | Skill核心功能（提交、审核、版本） | 2周 |
| 第四阶段 | 文件上传下载、通知、日志 | 1周 |
| 第五阶段 | H5移动端开发 | 1.5周 |
| 第六阶段 | 联调测试、Bug修复 | 1周 |
| 第七阶段 | 部署上线、文档交付 | 0.5周 |

**总工期预估**：8.5周

### 7.2 详细任务拆分

#### 第一阶段：基础框架（1周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| 后端框架搭建 | 1天 | Spring Boot项目初始化、配置 |
| 数据库设计与初始化 | 1天 | 表结构创建、初始数据 |
| 前端框架搭建 | 1天 | Vue3项目初始化、路由、状态管理 |
| 登录认证开发 | 1.5天 | JWT登录、登出、Token校验 |
| 权限框架集成 | 0.5天 | Spring Security集成 |

#### 第二阶段：用户与组织管理（1.5周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| 用户管理后端 | 2天 | CRUD、角色分配、启停用 |
| 用户管理前端 | 1.5天 | 列表、表单、操作 |
| 部门管理后端 | 1.5天 | 树形结构、负责人设置 |
| 部门管理前端 | 1天 | 树形组件、详情面板 |
| 项目管理 | 1.5天 | 后端+前端 |

#### 第三阶段：Skill核心功能（2周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| Skill提交后端 | 2天 | 信息保存、文件上传、版本处理 |
| Skill提交前端 | 2天 | 表单、文件上传、交互 |
| Skill列表后端 | 1天 | 分页、筛选、排序 |
| Skill列表前端 | 1.5天 | 卡片列表、筛选、排序 |
| Skill详情后端 | 1天 | 详情查询、权限校验 |
| Skill详情前端 | 1.5天 | 详情页、版本历史 |
| 审核功能后端 | 1天 | 审核、通知 |
| 审核功能前端 | 1天 | 列表、详情弹窗 |

#### 第四阶段：辅助功能（1周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| 文件上传下载 | 1.5天 | 本地存储、文件处理 |
| 评论评分 | 1天 | 发表、回复、评分 |
| 站内信 | 1天 | 发送、列表、已读 |
| 操作日志 | 1天 | 记录、查询、导出 |
| 下载日志 | 0.5天 | 记录、查询 |

#### 第五阶段：H5移动端（1.5周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| H5框架搭建 | 0.5天 | 项目初始化、适配 |
| 首页 | 1天 | 搜索、分类、推荐、热门 |
| 列表与详情 | 1.5天 | 列表、详情、下载 |
| 评论评分 | 0.5天 | 评论、评分 |
| 个人中心 | 0.5天 | 用户信息、下载历史 |

#### 第六阶段：测试与修复（1周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| 功能测试 | 2天 | 全功能测试 |
| Bug修复 | 2天 | 问题修复 |
| 性能优化 | 1天 | 接口优化、缓存优化 |

#### 第七阶段：部署交付（0.5周）

| 任务 | 预估工时 | 说明 |
| --- | --- | --- |
| 部署脚本 | 0.5天 | systemd服务配置、Nginx配置 |
| 上线部署 | 0.5天 | 生产环境部署 |
| 文档交付 | 1天 | 接口文档、部署文档、使用手册 |

---

## 8. 附录

### 8.1 技术风险与应对

| 风险 | 影响 | 应对措施 |
| --- | --- | --- |
| 文件存储空间不足 | 上传失败 | 监控存储使用率，设置告警阈值 |
| 并发下载压力大 | 响应慢 | 使用CDN加速、限流控制 |
| 数据库数据量大 | 查询慢 | 分表分库、索引优化、定期归档 |

### 8.2 后续优化方向

| 方向 | 说明 |
| --- | --- |
| 性能优化 | 接口缓存、数据库读写分离 |
| 功能扩展 | 敏感词过滤、推荐算法 |
| 运维增强 | 监控告警、日志分析平台 |
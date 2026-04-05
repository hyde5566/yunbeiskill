# 云贝科技 Skill 库管理系统设计文档

## 文档信息

| 项目名称 | 云贝科技 Skill 库管理系统 |
| --- | --- |
| 文档版本 | v1.0 |
| 创建日期 | 2026-04-05 |
| 关联PRD | skill-management-library-prd.md |
| 关联技术方案 | skill-management-library-technical-solution.md |

---

## 1. 项目概述

### 1.1 项目目标

建设"云贝科技 Skill 库管理"平台，用于统一管理、分发和追踪各类 skill 资源。核心解决 skill 分散难找、版本混乱、权限不清、下载无记录的问题。

### 1.2 平台形态

| 端 | 功能范围 |
| --- | --- |
| Web 管理端（PC） | 全部功能，包含管理功能 |
| H5 移动端 | 浏览、搜索、详情、下载、评分评论 |

### 1.3 开发策略

采用**全栈渐进式开发**，按技术方案的阶段顺序推进：
- 第1周：基础框架搭建
- 第2-3周：用户与组织管理
- 第4-5周：Skill核心功能
- 第6周：辅助功能
- 第7周：H5移动端
- 第8周：测试与部署

---

## 2. 环境配置

### 2.1 开发环境

| 组件 | 版本 | 配置值 |
| --- | --- | --- |
| Java | 21.0.10 LTS | `C:\Users\XD\.codebuddycn\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64` |
| MySQL | 8.0.41 | localhost:3306 |
| Redis | 服务运行中 | localhost:6379 |
| Node.js | v22.22.0 | 系统PATH |

### 2.2 数据库配置

| 配置项 | 值 |
| --- | --- |
| MySQL 用户 | root |
| MySQL 密码 | 123456 |
| 开发数据库 | yunbei_skill_dev |
| 正式数据库 | yunbei_skill |

### 2.3 系统配置

| 配置项 | 值 |
| --- | --- |
| 初始管理员账号 | admin |
| 初始管理员密码 | Yb@123456 |
| JWT有效期 | 7天 |
| 文件大小限制 | 50MB |
| 登录失败锁定规则 | 5次失败锁定30分钟 |
| 单设备登录 | 新登录踢掉旧登录 |

---

## 3. 项目结构

### 3.1 目录结构

```
d:\Project\yunbeiskill\
├── backend/                          # 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/yunbei/skill/
│   │   │   │   ├── config/           # 配置类
│   │   │   │   ├── controller/       # 控制器
│   │   │   │   ├── service/          # 服务层
│   │   │   │   ├── mapper/           # MyBatis Mapper
│   │   │   │   ├── entity/           # 实体类
│   │   │   │   ├── dto/              # 数据传输对象
│   │   │   │   ├── vo/               # 视图对象
│   │   │   │   ├── common/           # 公共类（响应、异常等）
│   │   │   │   ├── security/         # 安全认证
│   │   │   │   └── util/             # 工具类
│   │   │   └── resources/
│   │   │       ├── mapper/           # XML映射文件
│   │   │       ├── application.yml   # 配置文件
│   │   │       └── db/               # 数据库脚本
│   │   └── test/
│   ├── pom.xml                       # Maven配置
│   └── skill-backend.jar             # 构建产物
│
├── frontend/                         # Web管理端前端
│   ├── src/
│   │   ├── views/                    # 页面组件
│   │   ├── components/               # 公共组件
│   │   ├── api/                      # API请求
│   │   ├── stores/                   # Pinia状态管理
│   │   ├── router/                   # 路由配置
│   │   ├── utils/                    # 工具函数
│   │   └── assets/                   # 静态资源
│   ├── package.json
│   └── vite.config.js
│
├── h5/                               # H5移动端
│   ├── src/                          # 结构同frontend
│   ├── package.json
│   └── vite.config.js
│
├── docs/                             # 文档目录
│   └── superpowers/specs/            # 设计文档
│
├── skill-management-library-prd.md   # PRD文档
├── skill-management-library-technical-solution.md  # 技术方案
└── README.md                         # 项目说明
```

---

## 4. 第一阶段：基础框架

### 4.1 后端框架

**技术栈**：
- Spring Boot 3.2.x + Java 21
- MyBatis-Plus 3.5.x（ORM）
- HikariCP（连接池）
- Spring Security 6.x + JWT（认证）
- Redis（Token存储、缓存）

**核心配置**：
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/yunbei_skill_dev
    username: root
    password: 123456
  redis:
    host: localhost
    port: 6379

jwt:
  secret: ${JWT_SECRET}
  expiration: 604800000  # 7天

file:
  upload-path: /opt/skill/files
  max-size: 50MB
```

**统一响应封装**：
```java
public class Result<T> {
    private Integer code;      // 200成功，其他失败
    private String message;
    private T data;
    private Long timestamp;
}
```

### 4.2 数据库初始化

**执行顺序**：
1. 创建数据库 `yunbei_skill_dev`
2. 执行建表脚本（按技术方案3.2节）
3. 插入初始管理员账号（admin）
4. 插入初始菜单/权限数据

**第一阶段核心表**：
- `sys_user`（用户表）
- `sys_department`（部门表）
- `sys_notification`（站内信表）
- `log_operation`（操作日志表）

### 4.3 前端框架

**技术栈**：
- Vue 3.4.x + Vite 5.x
- Naive UI 2.x（组件库）
- Pinia（状态管理）
- Axios（HTTP请求）
- Vue Router 4.x

**路由结构**：
```
/login                # 登录页
/                     # 首页（Dashboard）
/skill                # Skill管理
  /list               # 列表
  /:id                # 详情
  /submit             # 提交
/review               # 审核（管理员）
/user                 # 账号管理（管理员）
/org                  # 组织管理（管理员）
  /dept               # 部门
  /project            # 项目
/notification         # 站内信
/log                  # 日志查询（管理员）
/settings             # 个人设置
```

### 4.4 登录认证模块

**认证流程**：
```
用户输入手机号+密码
    ↓
后端校验：账号是否存在、是否锁定、密码是否正确
    ↓
校验失败：记录失败次数，5次锁定30分钟
    ↓
校验成功：清零失败次数，生成JWT Token
    ↓
Token存入Redis（key: user:token:{userId}）
    ↓
返回Token给前端
    ↓
后续请求携带Token，后端校验Token有效性
```

**登录接口**：
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/logout` - 登出
- `PUT /api/v1/auth/password` - 修改密码
- `GET /api/v1/auth/info` - 获取当前用户信息

---

## 5. 第二阶段：用户与组织管理

### 5.1 用户管理

**功能清单**：
| 功能 | 说明 |
| --- | --- |
| 用户列表 | 分页查询、搜索（姓名/工号/手机号）、筛选（部门/角色/状态） |
| 新增用户 | 填写基本信息、设置初始密码、分配部门角色 |
| 编辑用户 | 修改信息，工号不可改 |
| 启用/停用 | 切换账号状态 |
| 删除用户 | 校验是否关联Skill，有则禁止删除 |

**接口设计**：
- `GET /api/v1/users` - 用户列表（分页）
- `POST /api/v1/users` - 新增用户
- `PUT /api/v1/users/{id}` - 编辑用户
- `DELETE /api/v1/users/{id}` - 删除用户
- `PUT /api/v1/users/{id}/status` - 启用/停用

### 5.2 部门管理

**数据结构**：树形层级，最多5级

**功能清单**：
| 功能 | 说明 |
| --- | --- |
| 部门树展示 | 左侧树形组件，支持展开/折叠 |
| 部门详情 | 右侧展示选中部门信息 + 成员列表 |
| 新增部门 | 填写名称、编码、上级部门、负责人 |
| 编辑部门 | 修改信息 |
| 删除部门 | 校验是否有子部门/员工/关联Skill |
| 设置负责人 | 从员工中选择 |

**删除校验规则**：
- 有子部门 → 提示先删除子部门
- 有员工 → 提示先转移员工
- 关联Skill → 禁止删除

### 5.3 项目管理

**功能清单**：
| 功能 | 说明 |
| --- | --- |
| 项目列表 | 表格展示，搜索、分页 |
| 新增项目 | 名称、编码、描述、成员（多选） |
| 编辑项目 | 修改信息 |
| 删除项目 | 校验是否关联Skill |
| 管理成员 | 弹窗选择员工，支持多选 |

### 5.4 权限框架

**三层权限控制**：
| 层级 | 实现方式 | 示例 |
| --- | --- | --- |
| 功能权限 | 路由守卫 + 自定义注解 | 管理员才能访问 `/user` 路由 |
| 数据权限 | MyBatis拦截器 | 开发者只能看到自己提交的Skill |
| 按钮权限 | 前端 `v-auth` 指令 | 只有管理员显示"删除"按钮 |

**角色定义**：
- `ROLE_USER`（使用者）：查看、下载、评分、评论
- `ROLE_DEVELOPER`（开发者）：+ 提交Skill、编辑自己Skill
- `ROLE_ADMIN`（管理员）：+ 全部管理功能

---

## 6. 第三阶段：Skill核心功能

### 6.1 Skill信息模型

**基本信息字段**：
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | String | Skill名称，英文小写+连字符，唯一 |
| description | String | 描述，50-200字 |
| type | Integer | 类型：1工作流辅助/2代码模板/3规范文档/4外部集成 |
| dept_id | Long | 归属部门 |
| project_ids | List | 归属项目（多选） |
| tags | List | 标签（多选） |
| source_type | Integer | 来源：1个人原创/2同事贡献/3第三方渠道 |
| source_desc | String | 来源说明（必填） |
| source_link | String | 来源链接（第三方时必填） |
| tutorial_url | String | 使用教程链接 |
| file_path | String | 文件包路径 |
| screenshots | List | 截图（最多5张） |

**系统字段**：
| 字段 | 说明 |
| --- | --- |
| status | 状态：0待审核/1已通过/2已拒绝/3已下架 |
| visibility | 可见性：0全员/1部门/2项目 |
| need_auth | 是否需授权申请 |
| auth_approver_id | 审批人ID |
| is_featured | 是否精选 |
| current_version | 当前版本号 |
| download_count | 下载次数 |
| avg_rating | 平均评分 |

### 6.2 Skill提交流程

```
开发者填写基本信息
    ↓
上传Skill文件包（.zip，必须含SKILL.md）
    ↓
可选上传截图（最多5张.jpg/.png）
    ↓
提交 → status=0（待审核）
    ↓
管理员审核 → 通过(status=1) 或 拒绝(status=2)
    ↓
通过后自动上架，用户可见可下载
```

**文件校验规则**：
- 文件包必须是 `.zip` 格式
- 最大 50MB
- 必须包含 `SKILL.md` 文件
- 存储命名：`skill名称_版本号_时间戳.zip`

### 6.3 Skill审核

**审核列表**：
- 状态筛选：待审核/已通过/已拒绝
- 展示：名称、类型、提交者、提交时间、状态

**审核操作**：
- 查看详情弹窗：基本信息 + 来源信息 + SKILL.md预览 + 截图
- 通过：状态改为已通过，发送站内信通知开发者
- 拒绝：填写拒绝原因，状态改为已拒绝，通知开发者

### 6.4 Skill列表与详情

**列表页**：
- 卡片网格布局（每行3-4个）
- 筛选：类型、部门、标签
- 排序：下载量、评分、更新时间、创建时间
- 搜索：名称、描述、标签关键词

**详情页结构**：
| 区域 | 内容 |
| --- | --- |
| 顶部信息 | 名称、类型、开发者、版本号、评分、下载量 |
| 操作区 | 下载按钮、评分组件 |
| 基本信息 | 描述、使用教程、标签列表 |
| 来源信息 | 来源类型、来源说明、来源链接（点击新窗口打开） |
| 截图区 | 图片轮播 |
| 版本历史 | 版本列表，可展开查看变更记录 |
| 评论区 | 平均评分、评分分布、评论列表、发表评论 |

### 6.5 版本管理

**版本规则**：
- 遵循 semver 规范（v主版本.次版本.修订版本）
- 版本号必须递增，不支持跳版本
- 历史版本保留，可追溯下载

### 6.6 文件上传下载

**上传接口**：
- `POST /api/v1/files/upload` - 上传文件，返回文件ID和路径

**下载流程**：
```
用户点击下载
    ↓
检查权限（是否需授权）
    ↓
需授权 → 检查是否已授权
    ↓
未授权 → 弹出申请授权弹窗
    ↓
已授权/无需授权 → 记录下载日志，返回文件流
```

---

## 7. 第四阶段：辅助功能

### 7.1 评分评论

**评分规则**：
| 规则 | 说明 |
| --- | --- |
| 评分范围 | 1-5星 |
| 评分权限 | 已下载用户可评分 |
| 评分次数 | 每用户每Skill仅一次，可修改 |
| 平均评分 | 实时计算，保留一位小数 |

**评论规则**：
| 规则 | 说明 |
| --- | --- |
| 评论权限 | 已下载用户可评论 |
| 评论长度 | 10-500字符 |
| 版本关联 | 评论自动关联当前最新版本号 |
| 多条评论 | 每用户可针对不同版本发表多条评论 |
| 编辑标记 | 编辑后显示"已编辑"标记 |

### 7.2 站内信通知

**通知场景**：
| 场景 | 通知对象 | 内容模板 |
| --- | --- | --- |
| Skill审核通过 | 开发者 | "您的Skill「xxx」已审核通过并上架" |
| Skill审核拒绝 | 开发者 | "您的Skill「xxx」审核未通过，原因：xxx" |
| Skill下架 | 开发者 | "您的Skill「xxx」已被下架，原因：xxx" |
| 授权申请待审批 | 审批人 | "用户xxx申请下载Skill「xxx」，请审批" |
| 授权申请通过 | 申请人 | "您申请的Skill「xxx」已授权，可前往下载" |
| 授权申请拒绝 | 申请人 | "您申请的Skill「xxx」未通过授权，原因：xxx" |
| 新版本发布 | 已下载用户 | "您下载的Skill「xxx」有新版本v1.1.0发布" |
| 评论回复 | 评论者 | "开发者回复了您对Skill「xxx」的评论" |

**通知功能**：
- 列表展示，已读/未读标记
- 标记已读、全部已读
- 永久保留

**接口设计**：
- `GET /api/v1/notifications` - 通知列表
- `PUT /api/v1/notifications/{id}/read` - 标记已读
- `PUT /api/v1/notifications/read-all` - 全部已读
- `GET /api/v1/notifications/unread-count` - 未读数量

### 7.3 日志模块

**操作日志**：
| 记录内容 | 说明 |
| --- | --- |
| 操作人 | 用户ID |
| 操作时间 | 时间戳 |
| 操作类型 | 登录、新增、编辑、删除、审核等 |
| 操作对象 | 对象类型 + 对象ID |
| 操作详情 | JSON格式详细记录 |
| 操作IP | 客户端IP |

**下载日志**：
| 记录内容 | 说明 |
| --- | --- |
| 下载用户 | 用户ID |
| 下载时间 | 时间戳 |
| Skill名称 | Skill ID + 名称 |
| 版本号 | 下载的版本 |

**接口设计**：
- `GET /api/v1/logs/operation` - 操作日志查询
- `GET /api/v1/logs/download` - 下载日志查询
- `GET /api/v1/logs/download/history` - 个人下载历史
- `GET /api/v1/logs/export` - 导出日志

### 7.4 统计报表

**Skill统计**：
| 统计项 | 说明 |
| --- | --- |
| 下载量排行 | 按下载次数排序Top10 |
| 评分分布 | 1-5星各占比 |
| 热门Skill | 最近30天下载量Top10 |
| 精选Skill | 管理员标记为精选的Skill |

**审核统计**：
| 统计项 | 说明 |
| --- | --- |
| 审核通过率 | 已通过/总数 |
| 平均审核时长 | 提交到审核通过的平均时间 |

---

## 8. 第五阶段：H5移动端

### 8.1 技术栈

与Web管理端共用技术栈，独立项目：
- Vue 3.4.x + Vite 5.x
- Naive UI（移动端适配）
- Pinia（状态管理）
- Axios（复用Web端API封装）

### 8.2 页面结构

**底部导航**：
| Tab | 页面 | 功能 |
| --- | --- | --- |
| 首页 | Home | 搜索、分类入口、推荐、热门、最新 |
| 分类 | Category | 类型分类筛选 |
| 搜索 | Search | 关键词搜索 |
| 我的 | Profile | 用户信息、下载历史、设置 |

### 8.3 首页设计

**页面结构**：
| 区域 | 内容 |
| --- | --- |
| 顶部搜索栏 | 搜索输入框，点击跳转搜索页 |
| 分类入口 | 4个类型图标 |
| 推荐Skill | 精选Skill卡片横滑展示（最多10个） |
| 热门Skill | 最近30天下载Top10列表 |
| 最新Skill | 最近7天发布Skill列表（最多20个） |

**推荐Skill规则**：
- 来源：管理员手动标记为"精选"的Skill
- 展示：最多10个，按精选时间倒序

**热门Skill规则**：
- 统计：最近30天下载量
- 更新：每日凌晨自动更新
- 展示：Top 10

### 8.4 Skill详情页

**页面结构**：
| 区域 | 内容 |
| --- | --- |
| 顶部 | 返回按钮 + Skill名称 |
| 信息区 | 类型、开发者、版本号、评分、下载量 |
| 操作区 | 下载按钮 + 评分入口 |
| 描述区 | Skill描述 |
| 来源区 | 来源类型、来源说明、来源链接（新窗口打开） |
| 截图区 | 图片轮播（如有） |
| 使用教程 | 链接入口（如有） |
| 标签区 | 标签列表，点击筛选 |
| 版本历史 | 可展开查看 |
| 评论入口 | 点击跳转评论页 |

### 8.5 个人中心

**页面结构**：
| 区域 | 内容 |
| --- | --- |
| 用户信息区 | 头像、姓名、部门、角色 |
| 功能入口 | 我的下载、我的评论 |
| 设置入口 | 账号设置（修改密码）、关于 |

---

## 9. 第六阶段：测试与修复

### 9.1 测试策略

**测试类型**：
| 类型 | 覆盖范围 | 执行方式 |
| --- | --- | --- |
| 单元测试 | 核心业务逻辑、工具类 | JUnit + Mockito |
| 接口测试 | REST API | Postman / Knife4j文档测试 |
| 功能测试 | 全功能验收 | 手动测试，按验收标准执行 |
| 性能测试 | 接口响应时间、并发下载 | JMeter |

### 9.2 Bug分级

| 级别 | 定义 | 处理时限 |
| --- | --- | --- |
| P0-致命 | 功能不可用、数据丢失 | 立即修复 |
| P1-严重 | 核心功能异常、性能严重问题 | 当天修复 |
| P2-一般 | 非核心功能异常、体验问题 | 2天内修复 |
| P3-轻微 | UI细节、文案问题 | 随版本修复 |

### 9.3 性能优化

| 优化点 | 方案 |
| --- | --- |
| 接口响应 | 添加Redis缓存（Skill列表、用户信息） |
| 数据库查询 | 索引优化、避免全表扫描 |
| 文件下载 | Nginx直接代理静态文件，不走后端 |
| 前端加载 | 路由懒加载、组件按需加载 |

---

## 10. 第七阶段：部署交付

### 10.1 部署架构

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
    │yunbei_skill │    │  (缓存)     │    │  (本地磁盘)  │
    └─────────────┘    └─────────────┘    └─────────────┘
```

### 10.2 部署配置

**后端 systemd 服务配置**：
```ini
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
```

**Nginx 配置**：
```nginx
server {
    listen 80;
    server_name skill.yunbei.com;

    location / {
        root /var/www/skill;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /files/ {
        alias /opt/skill/files/;
        autoindex off;
    }
}
```

### 10.3 交付文档

| 文档 | 内容 |
| --- | --- |
| 接口文档 | Knife4j自动生成，Swagger UI展示 |
| 部署文档 | 环境要求、部署步骤、配置说明 |
| 使用手册 | 用户操作指南（分角色） |
| 维护文档 | 日志查看、备份恢复、常见问题 |

### 10.4 备份策略

| 备份项 | 频率 | 保留周期 |
| --- | --- | --- |
| MySQL数据库 | 每日凌晨 | 30天 |
| 上传文件 | 每周 | 永久 |
| 应用日志 | 每周归档 | 90天 |

---

## 附录：接口设计清单

### 认证模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | /auth/login | 登录 |
| POST | /auth/logout | 登出 |
| PUT | /auth/password | 修改密码 |
| GET | /auth/info | 获取当前用户信息 |

### 用户管理模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /users | 用户列表 |
| POST | /users | 新增用户 |
| PUT | /users/{id} | 编辑用户 |
| DELETE | /users/{id} | 删除用户 |
| PUT | /users/{id}/status | 启用/停用用户 |

### 组织管理模块
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

### Skill管理模块
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
| GET | /skills/hot | 热门Skill |
| GET | /skills/recommended | 推荐Skill |
| GET | /skills/mine | 我提交的Skill |

### 标签管理模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /tags | 标签列表 |
| POST | /tags | 新增标签 |
| PUT | /tags/{id} | 编辑标签 |
| DELETE | /tags/{id} | 删除标签 |

### 审核模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /reviews | 审核列表 |
| PUT | /reviews/{id}/approve | 通过审核 |
| PUT | /reviews/{id}/reject | 拒绝审核 |

### 授权申请模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /auth-requests | 授权申请列表 |
| POST | /auth-requests | 申请授权 |
| GET | /auth-requests/pending | 待审批列表 |
| PUT | /auth-requests/{id}/approve | 通过授权申请 |
| PUT | /auth-requests/{id}/reject | 拒绝授权申请 |

### 文件模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | /files/upload | 文件上传 |
| GET | /files/download/{id} | 文件下载 |

### 通知模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /notifications | 通知列表 |
| PUT | /notifications/{id}/read | 标记已读 |
| PUT | /notifications/read-all | 全部已读 |

### 日志模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /logs/operation | 操作日志 |
| GET | /logs/download | 下载日志 |
| GET | /logs/download/history | 个人下载历史 |
| GET | /logs/export | 导出日志 |

### 统计报表模块
| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /statistics/skill | Skill统计 |
| GET | /statistics/review | 审核统计 |
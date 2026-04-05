# 第一阶段：后端框架与登录认证

## 目标
搭建 Spring Boot 后端项目，实现 JWT 登录认证功能。

## 前置条件
- Java 21 已安装
- MySQL 8.0 已安装
- Redis 已安装
- 数据库配置：Host: localhost, Port: 3306, 用户名: root, 密码: 123456
- 开发数据库名：yunbei_skill_dev
- 管理员账号：admin，密码：Yb@123456

## 实现步骤

### Step 1: 创建后端项目结构
```bash
mkdir -p backend/src/main/java/com/yunbei/skill
mkdir -p backend/src/main/resources
mkdir -p backend/src/test/java/com/yunbei/skill
```

### Step 2: 创建 pom.xml
定义 Maven 依赖：
- Spring Boot 3.2.x
- Spring Security 6.x
- JWT (jjwt)
- MyBatis-Plus 3.5.x
- MySQL Connector
- Redis
- Lombok

### Step 3: 创建数据库和初始表
```sql
CREATE DATABASE yunbei_skill_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 初始化管理员
INSERT INTO sys_user (username, password, real_name, status) VALUES
('admin', '$2a$10$...encrypted...', '系统管理员', 1);
```

### Step 4: 创建配置文件
- application.yml: 基础配置
- application-dev.yml: 开发环境配置

### Step 5: 实现后端核心代码

#### 5.1 实体类
- SysUser.java: 用户实体

#### 5.2 配置类
- SecurityConfig.java: Spring Security 配置
- JwtConfig.java: JWT 配置
- RedisConfig.java: Redis 配置
- MybatisPlusConfig.java: MyBatis-Plus 配置

#### 5.3 工具类
- JwtUtil.java: JWT 工具类
- SecurityUtil.java: 安全工具类

#### 5.4 API 实现
- AuthController.java: 登录/登出/修改密码
- Result.java: 统一响应封装
- GlobalExceptionHandler.java: 全局异常处理

### Step 6: 验证后端
- 启动 Spring Boot 应用
- 测试登录接口 POST /api/auth/login

### Step 7: 创建前端项目
```bash
cd frontend
npm create vite@latest . -- --template vue-ts
npm install naive-ui vue-router@4 pinia axios
```

### Step 8: 实现前端登录页面
- Login.vue: 登录表单
- router/index.ts: 路由配置
- api/auth.ts: 认证 API
- stores/user.ts: 用户状态

### Step 9: 集成测试
- 前后端联调登录功能
- 验证 JWT token 存储

## 验收标准
1. 后端启动成功，无报错
2. 数据库表创建成功，管理员账号存在
3. 登录接口返回 JWT token
4. 前端登录页面可正常访问
5. 前后端联调登录成功

## 预估时间
1-1.5 周
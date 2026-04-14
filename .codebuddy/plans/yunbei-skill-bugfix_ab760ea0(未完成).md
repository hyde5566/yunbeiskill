---
name: yunbei-skill-bugfix
overview: 修复前后端全面自测发现的所有问题，包括：JWT用户字段错误、DTO验证缺失、CORS端口不匹配、ValidationPipe配置、前端类型不匹配和pageSize超限等
todos:
  - id: fix-req-user
    content: 修复后端5个Controller中req.user.userId→req.user.id，download.controller补充departmentId查询
    status: pending
  - id: fix-dto-transform
    content: 为6个DTO文件的@IsNumber字段添加@Transform处理null/string值
    status: pending
  - id: fix-main-config
    content: 修复main.ts的CORS端口和ValidationPipe enableImplicitConversion
    status: pending
  - id: fix-frontend
    content: 修复前端3个页面pageSize和api/skill.ts类型定义
    status: pending
  - id: rebuild-verify
    content: 重新构建后端并验证所有修复
    status: pending
    dependencies:
      - fix-req-user
      - fix-dto-transform
      - fix-main-config
      - fix-frontend
---

## 产品概述

对云贝Skill管理系统进行全面前后端自测修复，确保所有CRUD操作、权限验证、数据交互正常运行后再交付给用户。

## 核心问题

1. 后端Controller中`req.user.userId`引用错误（JWT Strategy返回的是`id`而非`userId`），导致反馈、下载、评分、通知模块数据保存异常
2. DTO中`@IsNumber`字段缺少`@Transform`处理null值，Ant Design组件clearable时传null导致400错误
3. CORS端口不匹配（后端允许5173，前端运行5211），跨域请求被拒绝
4. ValidationPipe缺少`enableImplicitConversion`，query参数为字符串但controller期望数字
5. 前端API类型定义与后端返回不匹配，pageSize过大

## Tech Stack

- 后端：NestJS + TypeORM + class-validator + JWT
- 前端：Vue3 + Ant Design Vue + Pinia + Axios
- 数据库：MySQL

## Implementation Approach

系统性修复已审计出的所有前后端一致性问题，按优先级排序：先修后端核心BUG（req.user引用错误导致数据丢失），再修DTO验证问题（导致400错误），再修CORS和ValidationPipe配置，最后修前端类型和pageSize问题。

## Implementation Notes

- JWT Strategy validate返回`{ id, username, permissions }`，所有Controller必须用`req.user.id`
- download.controller.ts中`req.user.departmentId`不存在于JWT payload，需从数据库查询用户信息获取
- @Transform模式：`@Transform(({ value }) => { if (value === undefined || value === null || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })`
- CORS需同时允许5173（Vite默认）和5211（当前前端端口）
- 前端axios拦截器会解包`{ code, data }`响应，所以API类型应匹配`data`部分

## Directory Structure

### 后端修改文件

```
project1/yunbei-skill-api/src/
├── main.ts                                                    # [MODIFY] 添加enableImplicitConversion，修复CORS端口
├── modules/
│   ├── feedback/
│   │   ├── feedback.controller.ts                             # [MODIFY] req.user.userId → req.user.id（2处）
│   │   └── dto/create-feedback.dto.ts                         # [MODIFY] skillId、versionId添加@Transform
│   ├── download/
│   │   ├── download.controller.ts                             # [MODIFY] req.user.userId → req.user.id，departmentId从数据库查询
│   │   └── dto/create-download.dto.ts                         # [MODIFY] skillId、versionId添加@Transform
│   ├── rating/
│   │   ├── rating.controller.ts                               # [MODIFY] req.user.userId → req.user.id（2处）
│   │   └── dto/create-rating.dto.ts                           # [MODIFY] skillId、versionId、score添加@Transform
│   ├── notification/
│   │   └── notification.controller.ts                         # [MODIFY] req.user.userId → req.user.id（4处）
│   ├── department/
│   │   └── dto/
│   │       ├── create-dept.dto.ts                             # [MODIFY] sortOrder添加@Transform
│   │       └── update-dept.dto.ts                             # [MODIFY] parentId、sortOrder添加@Transform
│   └── permission/
│       └── dto/assign-permissions.dto.ts                       # [MODIFY] userId添加@Transform
```

### 前端修改文件

```
project1/yunbei-skill-web/src/
├── api/
│   └── skill.ts                                               # [MODIFY] getMySkills返回类型改为分页结果
├── pages/
│   ├── skill/
│   │   ├── SkillDetail.vue                                    # [MODIFY] pageSize:1000→100
│   │   └── SkillSubmit.vue                                    # [MODIFY] pageSize:1000→100
│   └── admin/
│       └── ProjectList.vue                                    # [MODIFY] pageSize:1000→100
```
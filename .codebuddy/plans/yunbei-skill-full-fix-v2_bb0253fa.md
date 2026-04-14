---
name: yunbei-skill-full-fix-v2
overview: 在原计划基础上，整合代码审查新发现的21个问题，按优先级修复前后端一致性bug、安全问题和性能问题
todos:
  - id: fix-critical-frontend
    content: 修复前端3个CRITICAL问题：MySubmissions.vue状态值、Submit.vue的visibility_type和编辑字段名
    status: completed
  - id: fix-high-frontend
    content: 修复前端HIGH问题：Submit.vue版本号输入、ProjectList.vue status值、api/skill.ts添加resubmitSkill
    status: completed
    dependencies:
      - fix-critical-frontend
  - id: fix-high-backend
    content: 修复后端HIGH问题：skill.controller.ts注入ProjectService获取userProjectIds、downloadZip记录下载
    status: completed
  - id: fix-medium-backend
    content: 修复后端MEDIUM问题：review.service.ts驳回更新version、jwt.strategy.ts移除fallback、CORS放宽
    status: completed
    dependencies:
      - fix-high-backend
  - id: fix-medium-frontend
    content: 修复前端MEDIUM问题：Detail.vue和ReviewDetail.vue v-html XSS防护
    status: completed
    dependencies:
      - fix-high-frontend
  - id: fix-low
    content: 修复LOW问题：StatisticsController添加权限保护、zipFile空值防护
    status: completed
    dependencies:
      - fix-medium-backend
      - fix-medium-frontend
  - id: rebuild-verify
    content: 重新构建并验证所有修复
    status: completed
    dependencies:
      - fix-low
---

## 产品概述

对云贝Skill管理系统进行全面前后端自测修复，基于代码审查发现的21个问题（3 CRITICAL、6 HIGH、7 MEDIUM、5 LOW），确保所有CRUD操作、权限验证、数据交互正常运行。

## 核心问题（审查新发现）

1. 前端状态值 `'pending'`/`'unpublished'` 与后端 `'pending_review'`/`'offline'` 不匹配，导致标签永远不显示
2. Submit.vue 中 `visibility_type` 前端 `'custom'` 与后端枚举 `'account'` 不匹配，导致400错误
3. Submit.vue 编辑模式加载详情时 camelCase/snake_case 字段名不匹配，编辑功能完全不可用
4. Submit.vue 中 `version_number` 硬编码 `'1.0.0'`，缺少版本号输入
5. MySubmissions.vue 引用未导入的 `resubmitSkill` 函数
6. 下载接口未调用 `recordDownload` 记录下载信息
7. SkillController.findPublished() 传入空 `userProjectIds`，项目可见性过滤失效
8. ReviewService 审核驳回时未更新 Version 状态
9. JWT Strategy 中 `default-secret` fallback 不安全
10. ProjectList.vue 中 status 用数字 1/0 但后端期望字符串 `'active'/'archived'`
11. Detail.vue 和 ReviewDetail.vue 使用 `v-html` 存在 XSS 风险
12. StatisticsController 缺少权限保护
13. CORS 配置只允许 5211，需放宽
14. SkillController create 中 zipFile 可能为 undefined 需防护

## 原计划已完成的修复（无需重复）

- req.user.userId -> req.user.id（全部Controller已修复）
- DTO @Transform（全部已添加）
- ValidationPipe enableImplicitConversion（已添加）
- CORS 端口已改为 5211（但需放宽）

## Tech Stack

- 后端：NestJS + TypeORM + class-validator + JWT + MySQL
- 前端：Vue3 + Ant Design Vue + Axios + Vite

## Implementation Approach

按优先级分批修复：先修 CRITICAL/HIGH 级别的前后端一致性问题（直接影响功能不可用），再修 MEDIUM 级别的安全和逻辑问题，最后处理 LOW 级别改进。核心策略是"前端对齐后端"，因为后端 entity/DTO 定义是数据模型的真实来源。

## Implementation Notes

- 后端所有 entity 使用 snake_case，前端必须使用 snake_case 读取后端返回数据
- 后端 Skill status 状态机：`draft` -> `pending_review` -> `reviewing` -> `approved`/`rejected` -> `published` -> `offline`
- 后端 Project status 使用字符串 `'active'`/`'archived'`，前端不能传数字 1/0
- JWT Strategy validate 返回 `{ id, username, realName, permissions }`
- ProjectService 已有 `getUserProjectIds(userId)` 方法可直接使用
- 前端 axios 拦截器解包 `{ code, data }` 响应，所以 API 返回值就是 `data` 部分

## Directory Structure

### 后端修改文件

```
pcodebuddy-glm5.1/yunbei-skill-api/src/
├── main.ts                                                     # [MODIFY] CORS放宽为环境变量或开发模式
├── modules/
│   ├── auth/
│   │   └── jwt.strategy.ts                                     # [MODIFY] 移除 'default-secret' fallback，配置缺失时抛错
│   ├── skill/
│   │   └── skill.controller.ts                                 # [MODIFY] 注入ProjectService获取userProjectIds；downloadZip添加下载记录和zipFile空值防护
│   ├── review/
│   │   └── review.service.ts                                   # [MODIFY] 驳回时同步更新version状态
│   └── statistics/
│       └── statistics.controller.ts                            # [MODIFY] 添加 @RequirePermission('admin') 保护
```

### 前端修改文件

```
pcodebuddy-glm5.1/yunbei-skill-web/src/
├── api/
│   └── skill.ts                                                # [MODIFY] 添加 resubmitSkill API 函数
├── pages/
│   ├── skill/
│   │   ├── MySubmissions.vue                                   # [MODIFY] status值 pending->pending_review, unpublished->offline；导入resubmitSkill
│   │   ├── Submit.vue                                          # [MODIFY] visibility_type custom->account；添加版本号输入；编辑加载改用snake_case；form.source->form.sourceType
│   │   └── Detail.vue                                          # [MODIFY] v-html添加DOMPurify净化
│   ├── review/
│   │   ├── PendingList.vue                                     # [MODIFY] review status显示值对齐（可选，review模块用的是pending非pending_review）
│   │   └── ReviewDetail.vue                                    # [MODIFY] v-html添加DOMPurify净化
│   └── admin/
│       └── ProjectList.vue                                     # [MODIFY] status 1/0->active/archived；编辑加载owner_id字段名修正
```

## Agent Extensions

### SubAgent

- **code-explorer**: 批量搜索验证修改影响范围，确保不遗漏引用点
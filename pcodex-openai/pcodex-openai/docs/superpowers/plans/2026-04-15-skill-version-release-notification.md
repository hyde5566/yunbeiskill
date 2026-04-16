# Skill Version Release Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Skill 新版本发布成功后，向已下载该 Skill 系列的用户生成站内通知，并提供通知列表、通知详情、标记已读能力。

**Architecture:** 后端新增轻量 `notifications` 数据模型和通知模块，在 Skill 发布流程内同步触发通知生成。前端把现有通知中心占位页升级为真实列表 + 详情 + 已读页面，并通过通知携带的 Skill 关联字段跳转到现有 Skill 详情页。

**Tech Stack:** NestJS、Prisma、MySQL、Vue 3、Vite、Vitest、Jest

---

## File Map

- Create:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.module.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.controller.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.service.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\dto\query-notifications.dto.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\notifications.e2e-spec.ts`
- Modify:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\app.module.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\notifications\NotificationPage.vue`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\router\index.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\api\client.test.ts`

## Task 1: 通知数据模型

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
- Test: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\schema.e2e-spec.ts`

- [ ] **Step 1: 写失败测试**

在 `schema.e2e-spec.ts` 新增通知表行为测试，验证：

```ts
it("creates and reads a skill version notification", async () => {
  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SKILL_VERSION_RELEASED",
      title: "Skill 新版本已发布：Demo Skill 1.1.0",
      content: "Demo Skill 已发布新版本 1.1.0，请前往详情页下载。",
      isRead: false,
      skillSeriesId: skill.seriesId ?? skill.id,
      skillId: skill.id,
      versionLabel: "1.1.0",
    },
  });

  const stored = await prisma.notification.findUnique({ where: { id: notification.id } });

  expect(stored?.type).toBe("SKILL_VERSION_RELEASED");
  expect(stored?.isRead).toBe(false);
  expect(stored?.skillSeriesId).toBe(skill.seriesId ?? skill.id);
});
```

- [ ] **Step 2: 跑测试确认红灯**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- schema.e2e-spec.ts
```

Expected: FAIL，报 Prisma client 或 schema 中不存在 `notification`

- [ ] **Step 3: 最小实现数据模型**

在 `schema.prisma` 增加通知模型与用户关系：

```prisma
enum NotificationType {
  SKILL_VERSION_RELEASED
}

model Notification {
  id            String           @id @default(cuid())
  userId        String           @map("user_id")
  type          NotificationType
  title         String
  content       String           @db.LongText
  isRead        Boolean          @default(false) @map("is_read")
  readAt        DateTime?        @map("read_at")
  skillSeriesId String?          @map("skill_series_id")
  skillId       String?          @map("skill_id")
  versionLabel  String?          @map("version_label")
  createdAt     DateTime         @default(now()) @map("created_at")
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
  @@map("notifications")
}
```

并在 `User` 模型增加：

```prisma
notifications Notification[]
```

- [ ] **Step 4: 推送 schema 并跑测试**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api prisma generate
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api prisma db push
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- schema.e2e-spec.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai/apps/api/prisma/schema.prisma' 'pcodex-openai/apps/api/test/schema.e2e-spec.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit -m "feat: add notification schema"
```

## Task 2: 后端通知模块

**Files:**
- Create:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.module.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.controller.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\notification.service.ts`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\notifications\dto\query-notifications.dto.ts`
- Modify:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\app.module.ts`
- Test:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\notifications.e2e-spec.ts`

- [ ] **Step 1: 写失败测试**

在 `notifications.e2e-spec.ts` 新增覆盖：

```ts
it("lists only current user's notifications", async () => {
  const response = await request(app.getHttpServer())
    .get("/notifications")
    .set("Authorization", userToken)
    .expect(200);

  expect(response.body.data.every((item: { userId?: string }) => !item.userId)).toBe(true);
});

it("marks a notification as read", async () => {
  const response = await request(app.getHttpServer())
    .patch(`/notifications/${notificationId}/read`)
    .set("Authorization", userToken)
    .expect(200);

  expect(response.body.data.isRead).toBe(true);
  expect(response.body.data.readAt).toBeTruthy();
});
```

- [ ] **Step 2: 跑测试确认红灯**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- notifications.e2e-spec.ts
```

Expected: FAIL，提示模块或路由不存在

- [ ] **Step 3: 实现最小通知模块**

在 controller 暴露：

```ts
@Get()
findAll(@CurrentUser() currentUser, @Query() query: QueryNotificationsDto) {}

@Get(":id")
findOne(@Param("id") id: string, @CurrentUser() currentUser) {}

@Patch(":id/read")
markAsRead(@Param("id") id: string, @CurrentUser() currentUser) {}
```

service 行为要求：

- 列表只返回当前用户通知
- 详情只允许查看自己的通知
- 标记已读幂等
- 返回字段包含：
  - `id`
  - `type`
  - `title`
  - `content`
  - `isRead`
  - `readAt`
  - `createdAt`
  - `skillSeriesId`
  - `skillId`
  - `versionLabel`

- [ ] **Step 4: 跑测试确认转绿**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- notifications.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api build
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai/apps/api/src/modules/notifications' 'pcodex-openai/apps/api/src/app.module.ts' 'pcodex-openai/apps/api/test/notifications.e2e-spec.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit -m "feat: add notification module"
```

## Task 3: 发布流程接入通知生成

**Files:**
- Modify:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
- Test:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\notifications.e2e-spec.ts`

- [ ] **Step 1: 写失败测试**

在 `notifications.e2e-spec.ts` 新增：

```ts
it("creates version release notifications for distinct downloaders when a new version is published", async () => {
  // 先发布首版并产生两次下载记录（其中一人下载多次）
  // 再提交并发布新版本
  // 断言只为去重后的下载用户生成通知
});

it("does not create notifications on first publish", async () => {
  // 首次发布后通知数不增加
});
```

断言至少覆盖：

- 仅新版本发布触发
- 同一用户多次下载只生成一条
- 非下载用户没有通知
- 通知标题与版本号正确

- [ ] **Step 2: 跑测试确认红灯**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- notifications.e2e-spec.ts
```

Expected: FAIL，通知未生成

- [ ] **Step 3: 在发布流程中接入通知生成**

在 `skill.service.ts` 的发布逻辑中补：

```ts
const hadPublishedVersion = await tx.skill.findFirst({
  where: {
    OR: [{ seriesId }, { id: seriesId }],
    status: SkillStatus.PUBLISHED,
    id: { not: skill.id },
  },
});

if (hadPublishedVersion) {
  await this.createVersionReleaseNotifications(tx, publishedSkill);
}
```

通知生成 helper 要点：

- 依据 `seriesId` 查 `skillDownloadRecord`
- 取唯一 `downloaderId`
- 过滤当前存在且有效的用户
- `createMany` 写通知
- 标题示例：

```ts
title: `Skill 新版本已发布：${skill.name} ${skill.versionLabel}`
```

- 正文示例：

```ts
content: `${skill.name} 已发布新版本 ${skill.versionLabel}。\n更新说明：${this.buildNotificationSummary(skill.changelog)}\n请前往 Skill 详情页下载。`
```

- [ ] **Step 4: 跑测试与构建**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- notifications.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- skills.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api build
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai/apps/api/src/modules/skills/skill.service.ts' 'pcodex-openai/apps/api/test/notifications.e2e-spec.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit -m "feat: trigger notifications on skill version publish"
```

## Task 4: 通知中心前端页面

**Files:**
- Modify:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\notifications\NotificationPage.vue`
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\router\index.ts`
- Test:
  - `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\api\client.test.ts`

- [ ] **Step 1: 写前端最小失败测试**

在 `client.test.ts` 补一条通知接口解析用例，确保后端错误文案仍能透出；若已有覆盖则新增针对通知详情或标记已读的请求测试。

```ts
it("surfaces notification read errors from api", async () => {
  // mock fetch 400 and assert Error message contains server text
});
```

- [ ] **Step 2: 跑测试确认基线**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test -- src/api/client.test.ts
```

Expected: PASS 或新增用例先 FAIL

- [ ] **Step 3: 实现通知中心页面**

`NotificationPage.vue` 至少实现：

- 列表加载
- `isRead` 筛选
- 详情查看
- 标记已读
- 跳转 Skill 详情页

建议状态结构：

```ts
const notifications = ref<NotificationRow[]>([]);
const selectedNotification = ref<NotificationRow | null>(null);
const filter = ref<"" | "true" | "false">("");
```

页面行为：

- 进入页面拉列表
- 点击通知加载详情并显示在右侧或下方
- 点击“标记已读”后刷新列表和详情状态
- “前往 Skill 详情”跳转到现有 Skill 页面，可附带 `skillId` 或 `seriesId`

- [ ] **Step 4: 跑前端测试与构建**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web build
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai/apps/web/src/pages/notifications/NotificationPage.vue' 'pcodex-openai/apps/web/src/router/index.ts' 'pcodex-openai/apps/web/src/api/client.test.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit -m "feat: add notification center"
```

## Task 5: 全量回归与收尾

**Files:**
- Review all modified files from Tasks 1-4

- [ ] **Step 1: 运行聚焦 API 回归**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- schema.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- notifications.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- skills.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api build
```

- [ ] **Step 2: 运行前端回归**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web build
```

- [ ] **Step 3: 检查工作区**

Run:

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' status --short -- 'pcodex-openai'
```

Expected: 只剩本轮改动，无意外脏文件

- [ ] **Step 4: 汇总结果并最终提交**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit -m "feat: add skill version release notifications"
```

## Self-Review

- Spec coverage:
  - 新版本发布通知：Task 3
  - 通知列表 / 详情 / 已读：Task 2 + Task 4
  - 首次发布不通知：Task 3 测试覆盖
  - 跳转 Skill 详情：Task 4
- Placeholder scan: 已去除泛化表述，每个任务给出文件、代码、命令和预期
- Type consistency:
  - 后端统一使用 `NotificationType.SKILL_VERSION_RELEASED`
  - 前端列表与详情统一使用 `skillSeriesId` / `skillId` / `versionLabel`

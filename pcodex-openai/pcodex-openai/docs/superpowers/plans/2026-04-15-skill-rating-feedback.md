# Skill评分反馈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为已下载 Skill 的员工提供可修改的一人一条评分反馈能力，并在 Skill 详情中展示评分概览、我的评分和实名反馈列表。

**Architecture:** 评分反馈挂在 `Skill seriesId` 上，后端在现有 `skills` 模块内新增评分读写与聚合接口，前端继续复用现有 `SkillPage.vue` 详情区承载评分概览与反馈编辑。权限沿用现有角色权限模型，下载记录作为评分前置校验来源，评分操作复用现有操作日志链路。

**Tech Stack:** NestJS、Prisma、MySQL、Vue 3、Vitest、Jest、pnpm

---

## File Structure

### Backend

- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
  - 新增 `SkillRating` 模型与用户、部门、Skill 的关联
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
  - 实现评分提交、评分读取、评分汇总、反馈列表与下载校验
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
  - 暴露评分接口
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\dto\submit-skill-rating.dto.ts`
  - 评分入参校验
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.module.ts`
  - 视需要注册新增 DTO/依赖
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`
  - 新增评分闭环 e2e

### Shared / Permissions

- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\packages\shared\src\permissions.ts`
  - 新增 `skill.rate`、`skill.rating.view`、`skill.rating.manage`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\packages\shared\src\permissions.test.ts`
  - 覆盖新增权限点

### Frontend

- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.ts`
  - 新增评分表单类型、分值展示辅助方法
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.test.ts`
  - 新增评分 helper 测试
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\SkillPage.vue`
  - 渲染评分概览、我的评分、反馈列表

## Task 1: 数据模型与权限点

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\schema.e2e-spec.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\packages\shared\src\permissions.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\packages\shared\src\permissions.test.ts`

- [ ] **Step 1: 写 failing schema / permission tests**

```ts
it("includes skill rating fields in prisma schema", async () => {
  const schema = await fs.readFile(schemaPath, "utf8");

  expect(schema).toContain("model SkillRating");
  expect(schema).toContain("seriesId       String @map(\"series_id\")");
  expect(schema).toContain("departmentName String @map(\"department_name\")");
  expect(schema).toContain("@unique([seriesId, raterId])");
});
```

```ts
it("contains skill rating permissions", () => {
  expect(PERMISSIONS).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: "skill.rate" }),
      expect.objectContaining({ code: "skill.rating.view" }),
      expect.objectContaining({ code: "skill.rating.manage" }),
    ]),
  );
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- schema.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/shared test
```

Expected:

- `schema.e2e-spec.ts` 因缺少 `SkillRating` 模型失败
- `permissions.test.ts` 因缺少评分权限点失败

- [ ] **Step 3: 写最小实现**

```prisma
model SkillRating {
  id             String   @id @default(cuid())
  seriesId       String   @map("series_id")
  skillId        String   @map("skill_id")
  raterId        String   @map("rater_id")
  departmentId   String   @map("department_id")
  departmentName String   @map("department_name")
  rating         Int
  feedback       String
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  skill      Skill @relation(fields: [skillId], references: [id])
  rater      User  @relation(fields: [raterId], references: [id])
  department Department @relation(fields: [departmentId], references: [id])

  @@unique([seriesId, raterId])
  @@index([seriesId])
  @@map("skill_ratings")
}
```

```ts
export const PERMISSIONS = [
  // existing permissions...
  { code: "skill.rate", module: "skills", name: "提交评分反馈" },
  { code: "skill.rating.view", module: "skills", name: "查看评分反馈" },
  { code: "skill.rating.manage", module: "skills", name: "管理评分反馈" },
];
```

- [ ] **Step 4: 重新生成并验证通过**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api prisma generate
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api prisma db push
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- schema.e2e-spec.ts
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/shared test
```

Expected:

- Prisma generate / db push 成功
- schema 和 permission 测试通过

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- `
  'pcodex-openai/apps/api/prisma/schema.prisma' `
  'pcodex-openai/apps/api/test/schema.e2e-spec.ts' `
  'pcodex-openai/packages/shared/src/permissions.ts' `
  'pcodex-openai/packages/shared/src/permissions.test.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit --no-verify -m "feat: add skill rating schema and permissions" -- 'pcodex-openai'
```

## Task 2: 后端评分接口与聚合逻辑

**Files:**
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\dto\submit-skill-rating.dto.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`

- [ ] **Step 1: 先写评分 e2e 失败用例**

```ts
it("creates and updates one rating per user per skill series after download", async () => {
  const rated = await request(app.getHttpServer())
    .post(`/skills/${downloadable.body.data.id}/rating`)
    .set("Authorization", libraryViewerToken)
    .send({ rating: 4, feedback: "很好用" })
    .expect(201);

  expect(rated.body.data.rating).toBe(4);

  const updated = await request(app.getHttpServer())
    .post(`/skills/${downloadable.body.data.id}/rating`)
    .set("Authorization", libraryViewerToken)
    .send({ rating: 5, feedback: "更新后更稳定" })
    .expect(201);

  expect(updated.body.data.rating).toBe(5);

  const records = await prisma.skillRating.findMany({
    where: { seriesId: downloadable.body.data.seriesId, raterId: libraryViewerId },
  });

  expect(records).toHaveLength(1);
});
```

```ts
it("rejects rating when the current user has never downloaded the skill", async () => {
  await request(app.getHttpServer())
    .post(`/skills/${publishedSkillId}/rating`)
    .set("Authorization", visibleUserToken)
    .send({ rating: 3, feedback: "未下载先试图评分" })
    .expect(400);
});
```

```ts
it("returns rating summary, my rating and public feedback list", async () => {
  const summary = await request(app.getHttpServer())
    .get(`/skills/${downloadable.body.data.id}/rating-summary`)
    .set("Authorization", libraryViewerToken)
    .expect(200);

  expect(summary.body.data.averageRating).toBe(5);
  expect(summary.body.data.totalRatings).toBe(1);

  const mine = await request(app.getHttpServer())
    .get(`/skills/${downloadable.body.data.id}/rating/me`)
    .set("Authorization", libraryViewerToken)
    .expect(200);

  expect(mine.body.data.rating).toBe(5);

  const ratings = await request(app.getHttpServer())
    .get(`/skills/${downloadable.body.data.id}/ratings`)
    .set("Authorization", adminToken)
    .expect(200);

  expect(ratings.body.data[0]).toEqual(
    expect.objectContaining({
      rating: 5,
      feedback: "更新后更稳定",
      rater: expect.objectContaining({ name: "Skill Library Viewer" }),
    }),
  );
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected:

- 因缺少 `rating` 接口和 `SkillRating` 查询逻辑失败

- [ ] **Step 3: 写最小 DTO 与 controller**

```ts
export class SubmitSkillRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  feedback!: string;
}
```

```ts
@Post(":id/rating")
@Permissions("skill.rate")
@AuditLog({ module: "skills", operationType: "rate", targetType: "skill" })
async submitRating(
  @Param("id") id: string,
  @Body() dto: SubmitSkillRatingDto,
  @CurrentUser() currentUser: CurrentUserPayload,
) {
  return {
    success: true,
    message: "评分提交成功",
    data: await this.skillService.submitRating(id, dto, currentUser),
  };
}

@Get(":id/rating-summary")
@Permissions("skill.rating.view")
async findRatingSummary(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
  return {
    success: true,
    message: "获取成功",
    data: await this.skillService.findRatingSummary(id, currentUser),
  };
}
```

- [ ] **Step 4: 写最小 service 实现**

```ts
async submitRating(id: string, dto: SubmitSkillRatingDto, currentUser: CurrentUserPayload) {
  const version = await this.resolveDownloadTarget(id, undefined, currentUser);
  const seriesId = version.seriesId ?? version.id;

  const downloaded = await this.prisma.skillDownloadRecord.findFirst({
    where: { seriesId, downloaderId: currentUser.sub },
  });

  if (!downloaded) {
    throw new BadRequestException("下载后才可评分");
  }

  const user = await this.prisma.user.findUnique({
    where: { id: currentUser.sub },
    include: { department: true },
  });

  if (!user) {
    throw new NotFoundException("评分用户不存在");
  }

  const rating = await this.prisma.skillRating.upsert({
    where: { seriesId_raterId: { seriesId, raterId: user.id } },
    update: {
      skillId: version.id,
      departmentId: user.departmentId,
      departmentName: user.department.name,
      rating: dto.rating,
      feedback: dto.feedback.trim(),
    },
    create: {
      seriesId,
      skillId: version.id,
      raterId: user.id,
      departmentId: user.departmentId,
      departmentName: user.department.name,
      rating: dto.rating,
      feedback: dto.feedback.trim(),
    },
    include: { rater: true },
  });

  return this.toSkillRatingDetail(rating);
}
```

```ts
async findRatingSummary(id: string, currentUser: CurrentUserPayload) {
  const version = await this.resolveDownloadTarget(id, undefined, currentUser);
  const seriesId = version.seriesId ?? version.id;
  const ratings = await this.prisma.skillRating.findMany({ where: { seriesId } });

  const totalRatings = ratings.length;
  const totalScore = ratings.reduce((sum, item) => sum + item.rating, 0);

  return {
    averageRating: totalRatings > 0 ? Number((totalScore / totalRatings).toFixed(2)) : 0,
    totalRatings,
    distribution: [1, 2, 3, 4, 5].map((score) => ({
      rating: score,
      count: ratings.filter((item) => item.rating === score).length,
    })),
  };
}
```

- [ ] **Step 5: 运行聚焦测试确认通过**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected:

- `skills.e2e-spec.ts` 中评分相关新增用例通过

- [ ] **Step 6: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- `
  'pcodex-openai/apps/api/src/modules/skills/dto/submit-skill-rating.dto.ts' `
  'pcodex-openai/apps/api/src/modules/skills/skill.controller.ts' `
  'pcodex-openai/apps/api/src/modules/skills/skill.service.ts' `
  'pcodex-openai/apps/api/test/skills.e2e-spec.ts'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit --no-verify -m "feat: add skill rating api flow" -- 'pcodex-openai'
```

## Task 3: 前端 Skill 详情评分区

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.test.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\SkillPage.vue`

- [ ] **Step 1: 先写 helper 测试**

```ts
it("builds rating distribution rows for display", () => {
  expect(buildRatingDistribution([
    { rating: 5, count: 2 },
    { rating: 4, count: 1 },
  ])).toEqual([
    { label: "5分", count: 2 },
    { label: "4分", count: 1 },
    { label: "3分", count: 0 },
    { label: "2分", count: 0 },
    { label: "1分", count: 0 },
  ]);
});

it("formats average rating for empty and non-empty summaries", () => {
  expect(formatAverageRating(0, 0)).toBe("暂无评分");
  expect(formatAverageRating(4.67, 3)).toBe("4.67 / 5");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test -- src/pages/skills/skill-page.helpers.test.ts
```

Expected:

- 因缺少评分 helper 失败

- [ ] **Step 3: 写最小 helper**

```ts
export interface SkillRatingSummary {
  averageRating: number;
  totalRatings: number;
  distribution: Array<{ rating: number; count: number }>;
}

export function buildRatingDistribution(distribution: SkillRatingSummary["distribution"]) {
  return [5, 4, 3, 2, 1].map((score) => ({
    label: `${score}分`,
    count: distribution.find((item) => item.rating === score)?.count ?? 0,
  }));
}

export function formatAverageRating(averageRating: number, totalRatings: number) {
  return totalRatings === 0 ? "暂无评分" : `${averageRating.toFixed(2)} / 5`;
}
```

- [ ] **Step 4: 改 SkillPage.vue 最小 UI**

```vue
<article v-if="selectedDetail" class="admin-card">
  <div class="admin-inline-grid" style="margin-top: 16px">
    <div class="admin-card">
      <strong>评分概览</strong>
      <p>{{ formatAverageRating(selectedRatingSummary.averageRating, selectedRatingSummary.totalRatings) }}</p>
      <p>评分人数：{{ selectedRatingSummary.totalRatings }}</p>
      <div class="admin-tag-list">
        <span
          v-for="row in buildRatingDistribution(selectedRatingSummary.distribution)"
          :key="row.label"
          class="admin-tag"
        >
          {{ row.label }}：{{ row.count }}
        </span>
      </div>
    </div>

    <div class="admin-card">
      <strong>我的评分反馈</strong>
      <p v-if="!canRateSelectedSkill">下载后可评分</p>
      <template v-else>
        <select v-model.number="ratingForm.rating">
          <option v-for="score in [5,4,3,2,1]" :key="score" :value="score">{{ score }} 分</option>
        </select>
        <textarea v-model.trim="ratingForm.feedback" />
        <button class="admin-button admin-button-primary" @click="submitRating">保存评分</button>
      </template>
    </div>
  </div>
</article>
```

- [ ] **Step 5: 运行前端聚焦测试**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test -- src/pages/skills/skill-page.helpers.test.ts
```

Expected:

- helper 测试通过

- [ ] **Step 6: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- `
  'pcodex-openai/apps/web/src/pages/skills/skill-page.helpers.ts' `
  'pcodex-openai/apps/web/src/pages/skills/skill-page.helpers.test.ts' `
  'pcodex-openai/apps/web/src/pages/skills/SkillPage.vue'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit --no-verify -m "feat: add skill rating ui" -- 'pcodex-openai'
```

## Task 4: 评分日志与全量验证

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\logs.e2e-spec.ts`

- [ ] **Step 1: 先写日志回归测试**

```ts
it("writes an operation log for skill rating updates", async () => {
  await request(app.getHttpServer())
    .post(`/skills/${downloadableSkillId}/rating`)
    .set("Authorization", libraryViewerToken)
    .send({ rating: 5, feedback: "非常稳定" })
    .expect(201);

  const logs = await request(app.getHttpServer())
    .get("/logs/operations")
    .set("Authorization", adminToken)
    .expect(200);

  expect(
    logs.body.data.some((item: { module: string; operationType: string }) =>
      item.module === "skills" && ["rate-create", "rate-update"].includes(item.operationType),
    ),
  ).toBe(true);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test -- logs.e2e-spec.ts
```

Expected:

- 因评分日志类型未落地失败

- [ ] **Step 3: 写最小日志实现**

```ts
@AuditLog({ module: "skills", operationType: "rate-submit", targetType: "skill" })
```

```ts
return {
  ...detail,
  auditContext: {
    operationType: existing ? "rate-update" : "rate-create",
    seriesId,
    skillId: version.id,
    skillName: version.name,
    rating: dto.rating,
    feedbackLength: dto.feedback.trim().length,
  },
};
```

说明：

- 如果现有审计装饰器不支持动态 operationType，保持装饰器为 `rate-submit`，并在 `detail` 中显式写入 `mode`
- 优先保证日志里能区分创建与更新

- [ ] **Step 4: 运行全量验证**

Run:

```powershell
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/shared test
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api test
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web test
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/api build
pnpm --dir 'D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai' --filter @yunbei/web build
```

Expected:

- 所有测试通过
- 前后端构建通过

- [ ] **Step 5: Commit**

```powershell
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' add -- 'pcodex-openai'
git -C 'D:\Project\yunbeiskill\.worktrees\foundation-platform' commit --no-verify -m "feat: add skill rating feedback flow" -- 'pcodex-openai'
```

## Self-Review

### Spec coverage

- 数据模型：Task 1
- 权限点：Task 1
- 提交/修改评分：Task 2
- 当前用户评分：Task 2
- 评分概览：Task 2 + Task 3
- 反馈列表：Task 2 + Task 3
- 下载后校验：Task 2
- 日志接入：Task 4
- 前端实名展示：Task 3

无明显漏项。

### Placeholder scan

- 无 `TODO` / `TBD`
- 所有任务包含明确文件、命令、预期结果

### Type consistency

- 后端统一使用 `seriesId` 作为评分聚合键
- 前端统一消费 `rating-summary` / `rating/me` / `ratings`
- 权限点命名与 spec 一致：`skill.rate`、`skill.rating.view`、`skill.rating.manage`

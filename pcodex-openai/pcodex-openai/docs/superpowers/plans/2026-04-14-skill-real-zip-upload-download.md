# Skill Real Zip Upload Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Zip upload and download for Skill submission and versioning using project-local file storage, while preserving history and automatic download records.

**Architecture:** Keep Skill business rules in the existing `skills` module and add a focused local file storage service under that module. Upload flows move from JSON to `multipart/form-data`, while download becomes a protected streaming endpoint that validates visibility, serves the file, and records the download in one path.

**Tech Stack:** NestJS, Prisma, MySQL, Vue 3, Vite, Vitest, Jest, Multer/file upload interceptors, Node.js filesystem APIs

---

## File Structure

### Existing files to modify

- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
  - Extend `Skill` with file metadata columns.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\main.ts`
  - Ensure environment-backed storage directory exists at startup if needed.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.module.ts`
  - Register the new storage service.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
  - Change create/version endpoints to multipart, add real download endpoint.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
  - Persist file metadata, validate file-backed downloads, record download on success.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`
  - Cover upload/download success and failures.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\api\client.ts`
  - Support `FormData` requests and blob downloads with auth token.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.ts`
  - Add file validation and multipart payload helpers.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.test.ts`
  - Add helper tests for upload and download helpers.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\SkillPage.vue`
  - Add file pickers and replace fake download with real file download.

### New files to create

- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\storage\skill-storage.service.ts`
  - Single responsibility: validate, save, read, and remove local Zip files.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\storage\skill-storage.service.spec.ts`
  - Unit tests for path generation and file validation.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-download.client.ts`
  - Browser-side helper to fetch blob downloads and trigger save.
- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-download.client.test.ts`
  - Tests for filename parsing and authenticated download request behavior.

### Runtime directories to ensure exist

- `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\storage\skills`

---

### Task 1: Extend schema and storage configuration

**Files:**
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\docs\superpowers\plans\2026-04-14-skill-real-zip-upload-download.md`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\prisma\schema.prisma`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\main.ts`
- Test: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\schema.e2e-spec.ts`

- [ ] **Step 1: Write the failing schema test expectation**

```ts
it("includes skill package metadata fields in prisma schema", async () => {
  const schema = await fs.promises.readFile(schemaPath, "utf8");

  expect(schema).toContain("packageOriginalName");
  expect(schema).toContain("packageStoredName");
  expect(schema).toContain("packageRelativePath");
  expect(schema).toContain("packageMimeType");
  expect(schema).toContain("packageChecksum");
  expect(schema).toContain("packageUploadedAt");
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- schema.e2e-spec.ts
```

Expected: FAIL because the new schema fields are missing.

- [ ] **Step 3: Add the new Prisma fields and storage bootstrap**

```prisma
packageOriginalName String?   @map("package_original_name")
packageStoredName   String?   @map("package_stored_name")
packageRelativePath String?   @map("package_relative_path")
packageMimeType     String?   @map("package_mime_type")
packageChecksum     String?   @map("package_checksum")
packageUploadedAt   DateTime? @map("package_uploaded_at")
```

```ts
import fs from "node:fs";
import path from "node:path";

const skillStorageDir =
  process.env.SKILL_STORAGE_DIR ??
  path.resolve(process.cwd(), "..", "..", "storage", "skills");

fs.mkdirSync(skillStorageDir, { recursive: true });
```

- [ ] **Step 4: Run generate, push, and the focused schema test**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api prisma generate
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api prisma db push
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- schema.e2e-spec.ts
```

Expected: Prisma client regenerates, schema sync succeeds, focused test passes.

- [ ] **Step 5: Commit**

```bash
git add "pcodex-openai/apps/api/prisma/schema.prisma" "pcodex-openai/apps/api/src/main.ts" "pcodex-openai/apps/api/test/schema.e2e-spec.ts"
git commit -m "feat: add skill package metadata schema"
```

### Task 2: Add local skill storage service

**Files:**
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\storage\skill-storage.service.ts`
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\storage\skill-storage.service.spec.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.module.ts`

- [ ] **Step 1: Write the failing unit test for file validation and stored name generation**

```ts
it("accepts zip files up to 50MB and returns persisted metadata", async () => {
  const result = await service.saveSkillPackage({
    skillId: "skill-1",
    file: {
      originalname: "helper.zip",
      mimetype: "application/zip",
      size: 1024,
      buffer: Buffer.from("zip"),
    } as Express.Multer.File,
  });

  expect(result.originalName).toBe("helper.zip");
  expect(result.storedName).toMatch(/^skill-1_/);
  expect(result.relativePath).toContain("skills");
  expect(result.mimeType).toBe("application/zip");
  expect(result.sizeBytes).toBe(1024);
  expect(result.checksum).toHaveLength(64);
});
```

```ts
it("rejects non-zip files", async () => {
  await expect(
    service.saveSkillPackage({
      skillId: "skill-1",
      file: {
        originalname: "helper.txt",
        mimetype: "text/plain",
        size: 8,
        buffer: Buffer.from("bad"),
      } as Express.Multer.File,
    }),
  ).rejects.toThrow("仅支持上传 Zip 包");
});
```

- [ ] **Step 2: Run the storage service unit test to verify it fails**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skill-storage.service.spec.ts
```

Expected: FAIL because the service file and provider do not exist yet.

- [ ] **Step 3: Implement the storage service with explicit metadata output**

```ts
export interface StoredSkillPackage {
  originalName: string;
  storedName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  uploadedAt: Date;
}

@Injectable()
export class SkillStorageService {
  async saveSkillPackage(input: { skillId: string; file: Express.Multer.File }): Promise<StoredSkillPackage> {
    // validate extension, size, checksum, mkdir, write file
  }

  async openReadStream(relativePath: string) {
    // resolve under storage dir and verify file exists
  }

  async removeStoredFile(relativePath: string) {
    // best-effort cleanup
  }
}
```

```ts
@Module({
  controllers: [SkillController],
  providers: [SkillService, SkillStorageService],
  exports: [SkillService, SkillStorageService],
})
export class SkillModule {}
```

- [ ] **Step 4: Run the focused storage service test**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skill-storage.service.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "pcodex-openai/apps/api/src/modules/skills/storage/skill-storage.service.ts" "pcodex-openai/apps/api/src/modules/skills/storage/skill-storage.service.spec.ts" "pcodex-openai/apps/api/src/modules/skills/skill.module.ts"
git commit -m "feat: add local skill package storage service"
```

### Task 3: Convert skill submission and version submission to multipart upload

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\dto\create-skill.dto.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\dto\create-skill-version.dto.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`

- [ ] **Step 1: Write failing API tests for multipart submit and version upload**

```ts
it("creates a skill from multipart data with a zip file", async () => {
  const response = await request(app.getHttpServer())
    .post("/skills")
    .set("Authorization", adminToken)
    .field("name", `Zip Skill ${Date.now()}`)
    .field("summary", "Zip summary")
    .field("description", "Zip description")
    .field("authorName", "系统管理员")
    .field("categoryId", categoryId)
    .field("sourceType", "INTERNAL")
    .field("visibility", "ALL_USERS")
    .field("packageName", "zip-skill.zip")
    .field("packageSizeBytes", "4")
    .field("changelog", "Initial")
    .attach("packageFile", Buffer.from("PK\x03\x04"), "zip-skill.zip")
    .expect(201);

  expect(response.body.data.packageOriginalName).toBe("zip-skill.zip");
  expect(response.body.data.packageStoredName).toContain(response.body.data.id);
});
```

```ts
it("rejects skill creation when package file is missing", async () => {
  await request(app.getHttpServer())
    .post("/skills")
    .set("Authorization", adminToken)
    .field("name", "Missing zip")
    .field("summary", "summary")
    .field("description", "description")
    .field("authorName", "系统管理员")
    .field("categoryId", categoryId)
    .field("sourceType", "INTERNAL")
    .field("visibility", "ALL_USERS")
    .field("changelog", "Initial")
    .expect(400);
});
```

- [ ] **Step 2: Run the focused skill API test to verify it fails**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected: FAIL because controller/service still expect JSON only.

- [ ] **Step 3: Implement multipart handling in controller and service**

```ts
@Post()
@UseInterceptors(FileInterceptor("packageFile", { storage: memoryStorage() }))
async create(
  @UploadedFile() packageFile: Express.Multer.File,
  @Body() dto: CreateSkillDto,
  @CurrentUser() currentUser: CurrentUserPayload,
) {
  return {
    success: true,
    message: "提交成功",
    data: await this.skillService.create(dto, packageFile, currentUser),
  };
}
```

```ts
async create(
  dto: CreateSkillDto,
  packageFile: Express.Multer.File | undefined,
  currentUser: CurrentUserPayload,
) {
  if (!packageFile) {
    throw new BadRequestException("请上传 Zip 包");
  }

  const storedPackage = await this.skillStorageService.saveSkillPackage({
    skillId: createId(),
    file: packageFile,
  });

  // create db row using storedPackage metadata and cleanup on failure
}
```

- [ ] **Step 4: Run the focused multipart API test**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected: PASS for multipart create/version scenarios.

- [ ] **Step 5: Commit**

```bash
git add "pcodex-openai/apps/api/src/modules/skills/skill.controller.ts" "pcodex-openai/apps/api/src/modules/skills/skill.service.ts" "pcodex-openai/apps/api/src/modules/skills/dto/create-skill.dto.ts" "pcodex-openai/apps/api/src/modules/skills/dto/create-skill-version.dto.ts" "pcodex-openai/apps/api/test/skills.e2e-spec.ts"
git commit -m "feat: support multipart skill package uploads"
```

### Task 4: Add protected file download endpoint with automatic download records

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.controller.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\src\modules\skills\skill.service.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`

- [ ] **Step 1: Write the failing API test for real download**

```ts
it("downloads the latest published zip and records the download", async () => {
  const response = await request(app.getHttpServer())
    .get(`/skills/${publishedSkillId}/download`)
    .set("Authorization", libraryViewerToken)
    .expect(200);

  expect(response.headers["content-type"]).toContain("application/zip");
  expect(response.headers["content-disposition"]).toContain(".zip");

  const history = await request(app.getHttpServer())
    .get("/skills/downloads/history")
    .set("Authorization", libraryViewerToken)
    .expect(200);

  expect(history.body.data.some((row: { seriesId: string }) => row.seriesId === publishedSeriesId)).toBe(true);
});
```

```ts
it("rejects download when the underlying file is missing", async () => {
  await request(app.getHttpServer())
    .get(`/skills/${publishedSkillId}/download`)
    .set("Authorization", viewerTokenForMissingFile)
    .expect(404);
});
```

- [ ] **Step 2: Run the focused skill API test to verify it fails**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected: FAIL because `/skills/:id/download` does not exist yet.

- [ ] **Step 3: Implement the streaming endpoint and record writing**

```ts
@Get(":id/download")
@Permissions("skill.download")
@AuditLog({ module: "skills", operationType: "download", targetType: "skill" })
async downloadFile(
  @Param("id") id: string,
  @Query("versionId") versionId: string | undefined,
  @CurrentUser() currentUser: CurrentUserPayload,
  @Res({ passthrough: true }) response: Response,
) {
  const result = await this.skillService.download(id, versionId, currentUser);
  response.setHeader("Content-Type", result.mimeType);
  response.setHeader("Content-Disposition", contentDisposition(result.downloadName));
  return new StreamableFile(result.stream);
}
```

```ts
async download(id: string, versionId: string | undefined, currentUser: CurrentUserPayload) {
  const version = await this.resolveDownloadTarget(id, versionId, currentUser);
  const stream = await this.skillStorageService.openReadStream(version.packageRelativePath!);
  await this.createDownloadRecord(version, currentUser);
  return {
    stream,
    mimeType: version.packageMimeType ?? "application/zip",
    downloadName: version.packageOriginalName ?? version.packageName,
  };
}
```

- [ ] **Step 4: Run the focused skill API test**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test -- skills.e2e-spec.ts
```

Expected: PASS for download success and missing-file failure.

- [ ] **Step 5: Commit**

```bash
git add "pcodex-openai/apps/api/src/modules/skills/skill.controller.ts" "pcodex-openai/apps/api/src/modules/skills/skill.service.ts" "pcodex-openai/apps/api/test/skills.e2e-spec.ts"
git commit -m "feat: add real skill package download endpoint"
```

### Task 5: Update frontend to upload real files and download blobs

**Files:**
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-download.client.ts`
- Create: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-download.client.test.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\api\client.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\skill-page.helpers.test.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\SkillPage.vue`

- [ ] **Step 1: Write the failing frontend helper tests**

```ts
it("builds multipart form data for skill submission", () => {
  const file = new File(["zip"], "helper.zip", { type: "application/zip" });
  const payload = buildSkillFormData(validSkillForm, file);

  expect(payload.get("name")).toBe(validSkillForm.name);
  expect(payload.get("packageFile")).toBe(file);
});
```

```ts
it("rejects non-zip files before submit", () => {
  const file = new File(["bad"], "helper.txt", { type: "text/plain" });
  expect(validateSkillZipFile(file)).toBe("仅支持上传 Zip 包");
});
```

```ts
it("uses auth token when downloading a skill blob", async () => {
  window.localStorage.setItem("accessToken", "token-1");
  await downloadSkillPackage("/skills/abc/download");
  expect(fetch).toHaveBeenCalledWith(
    "/skills/abc/download",
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
    }),
  );
});
```

- [ ] **Step 2: Run the focused web tests to verify they fail**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web test -- src/pages/skills/skill-page.helpers.test.ts src/pages/skills/skill-download.client.test.ts
```

Expected: FAIL because the new helper functions and download client do not exist yet.

- [ ] **Step 3: Implement FormData helpers and blob download client**

```ts
export function validateSkillZipFile(file: File | null) {
  if (!file) return "请上传 Zip 包";
  if (!file.name.toLowerCase().endsWith(".zip")) return "仅支持上传 Zip 包";
  if (file.size > 50 * 1024 * 1024) return "Zip 包大小不能超过 50MB";
  return "";
}

export function buildSkillFormData(form: SkillFormState, file: File) {
  const payload = new FormData();
  payload.set("name", form.name.trim());
  payload.set("summary", form.summary.trim());
  payload.set("packageFile", file);
  return payload;
}
```

```ts
export async function downloadSkillPackage(input: string) {
  const token = window.localStorage.getItem("accessToken");
  const response = await fetch(input, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  // blob, parse content-disposition, create object URL, click link, revoke URL
}
```

- [ ] **Step 4: Update `SkillPage.vue` to use real file upload/download**

```vue
<input accept=".zip" type="file" @change="onSkillFileChange" />

<button
  class="admin-button admin-button-secondary"
  :disabled="downloadSubmittingId === selectedDetail.id"
  @click="downloadLatestSkill(selectedDetail.id)"
>
  {{ downloadSubmittingId === selectedDetail.id ? "下载中..." : "下载当前版本 Zip" }}
</button>
```

```ts
const packageFile = ref<File | null>(null);

async function submitSkill() {
  const fileError = validateSkillZipFile(packageFile.value);
  if (fileError) {
    errorMessage.value = fileError;
    return;
  }

  await apiRequest("/skills", {
    method: "POST",
    body: buildSkillFormData(form, packageFile.value!),
  });
}
```

- [ ] **Step 5: Run the focused and then full web tests**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web test -- src/pages/skills/skill-page.helpers.test.ts src/pages/skills/skill-download.client.test.ts
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web test
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web build
```

Expected: PASS for focused tests, then all web tests pass and build succeeds.

- [ ] **Step 6: Commit**

```bash
git add "pcodex-openai/apps/web/src/api/client.ts" "pcodex-openai/apps/web/src/pages/skills/skill-page.helpers.ts" "pcodex-openai/apps/web/src/pages/skills/skill-page.helpers.test.ts" "pcodex-openai/apps/web/src/pages/skills/SkillPage.vue" "pcodex-openai/apps/web/src/pages/skills/skill-download.client.ts" "pcodex-openai/apps/web/src/pages/skills/skill-download.client.test.ts"
git commit -m "feat: wire real skill package upload and download in web app"
```

### Task 6: Run full regression verification and cleanup

**Files:**
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\logs.e2e-spec.ts` (only if download audit side-effects require stable assertions)
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\api\test\skills.e2e-spec.ts`
- Modify: `D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\apps\web\src\pages\skills\SkillPage.vue`

- [ ] **Step 1: Run full backend verification**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api test
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/api build
```

Expected: All API suites pass and build succeeds.

- [ ] **Step 2: Run shared and full frontend verification**

Run:

```bash
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/shared test
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web test
pnpm --dir "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai" --filter @yunbei/web build
```

Expected: Shared tests pass, all web tests pass, web build succeeds.

- [ ] **Step 3: Verify runtime storage directory behavior manually**

Run:

```bash
Get-ChildItem "D:\Project\yunbeiskill\.worktrees\foundation-platform\pcodex-openai\storage\skills"
```

Expected: Directory exists, uploaded test files are stored with generated names.

- [ ] **Step 4: Review diff for scope**

Run:

```bash
git -C "D:\Project\yunbeiskill\.worktrees\foundation-platform" diff --stat HEAD~5..HEAD -- "pcodex-openai"
git -C "D:\Project\yunbeiskill\.worktrees\foundation-platform" status --short -- "pcodex-openai"
```

Expected: Only planned files are modified, no unrelated legacy paths included.

- [ ] **Step 5: Commit any final regression fix**

```bash
git add "pcodex-openai"
git commit -m "test: finalize real skill package regression coverage"
```

---

## Self-Review Checklist

### Spec coverage

- Local storage directory: covered by Task 1 and Task 2
- File metadata fields: covered by Task 1
- Multipart upload for new Skill and version: covered by Task 3
- Real download endpoint: covered by Task 4
- Automatic download records: covered by Task 4
- Frontend file picker and blob download: covered by Task 5
- Old data compatibility and regression verification: covered by Task 6

### Placeholder scan

- No `TODO`, `TBD`, or “implement later”
- Every task names concrete files
- Every code-changing step includes a code snippet
- Every verification step includes an exact command

### Type consistency

- Storage service returns `StoredSkillPackage`
- Skill service consumes file metadata from `SkillStorageService`
- Frontend uses `buildSkillFormData`, `validateSkillZipFile`, and `downloadSkillPackage`


import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("skills", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let submitterToken: string;
  let libraryViewerToken: string;
  let categoryId: string;
  let secondaryCategoryId: string;
  let projectId: string;
  let visibleUserId: string;
  let libraryViewerId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: "admin", password: "Admin@123456" })
      .expect(201);

    adminToken = `Bearer ${login.body.data.accessToken}`;

    const category = await prisma.skillCategory.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    });

    if (!category) {
      throw new Error("active skill category not found");
    }

    categoryId = category.id;

    const secondaryCategory = await prisma.skillCategory.findFirst({
      where: {
        status: "ACTIVE",
        id: { not: category.id },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (!secondaryCategory) {
      throw new Error("secondary skill category not found");
    }

    secondaryCategoryId = secondaryCategory.id;

    const project = await prisma.project.create({
      data: {
        name: `Skill-Project-${Date.now()}`,
        description: "Skill visibility project",
        status: "ACTIVE",
      },
    });

    projectId = project.id;

    const rootDepartment = await prisma.department.findUnique({
      where: { code: "root" },
    });

    if (!rootDepartment) {
      throw new Error("root department not found");
    }

    const visibleUser = await prisma.user.create({
      data: {
        account: `skill_visible_${Date.now()}`,
        name: "Skill Visible User",
        passwordHash: "not-used-in-test",
        departmentId: rootDepartment.id,
        status: "ACTIVE",
      },
    });

    visibleUserId = visibleUser.id;

    const libraryRole = await prisma.role.create({
      data: {
        code: `skill-library-${Date.now()}`,
        name: "Skill查看人",
        status: "ACTIVE",
      },
    });

    const libraryPermissions = await prisma.permission.findMany({
      where: {
        code: {
          in: [
            "skill.library.view",
            "skill.download",
            "skill.download-history.view",
            "skill.rate",
            "skill.rating.view",
          ],
        },
      },
    });

    if (libraryPermissions.length !== 5) {
      throw new Error("library rating permissions not found");
    }

    await prisma.rolePermission.createMany({
      data: libraryPermissions.map((permission) => ({
        roleId: libraryRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    const viewerAccount = `skill_library_${Date.now()}`;
    const viewerPassword = "Viewer@123456";

    const viewer = await prisma.user.create({
      data: {
        account: viewerAccount,
        name: "Skill Library Viewer",
        passwordHash: await bcrypt.hash(viewerPassword, 10),
        departmentId: rootDepartment.id,
        status: "ACTIVE",
      },
    });

    libraryViewerId = viewer.id;

    await prisma.userRole.create({
      data: {
        userId: viewer.id,
        roleId: libraryRole.id,
      },
    });

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: viewer.id,
      },
    });

    const viewerLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: viewerAccount, password: viewerPassword })
      .expect(201);

    libraryViewerToken = `Bearer ${viewerLogin.body.data.accessToken}`;

    const submitRole = await prisma.role.create({
      data: {
        code: `skill-submit-${Date.now()}`,
        name: "Skill提交人",
        status: "ACTIVE",
      },
    });

    const submitPermission = await prisma.permission.findUnique({
      where: { code: "skill.submit" },
    });

    if (!submitPermission) {
      throw new Error("skill.submit permission not found");
    }

    await prisma.rolePermission.create({
      data: {
        roleId: submitRole.id,
        permissionId: submitPermission.id,
      },
    });

    const submitterAccount = `skill_submit_${Date.now()}`;
    const submitterPassword = "Submit@123456";

    const submitter = await prisma.user.create({
      data: {
        account: submitterAccount,
        name: "Skill Submitter",
        passwordHash: await bcrypt.hash(submitterPassword, 10),
        departmentId: rootDepartment.id,
        status: "ACTIVE",
      },
    });

    await prisma.userRole.create({
      data: {
        userId: submitter.id,
        roleId: submitRole.id,
      },
    });

    const submitterLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: submitterAccount, password: submitterPassword })
      .expect(201);

    submitterToken = `Bearer ${submitterLogin.body.data.accessToken}`;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  function buildZipBuffer() {
    return Buffer.from("PK\x03\x04skill-test");
  }

  const parseBinary: (res: any, callback: (error: Error | null, body: Buffer) => void) => void = (
    res,
    callback,
  ) => {
    const chunks: Buffer[] = [];
    res.setEncoding("binary");
    res.on("data", (chunk: Buffer | string | undefined) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk ?? "", "binary"));
    });
    res.on("end", () => {
      callback(null, Buffer.concat(chunks));
    });
  };

  function createSkillRequest(
    token: string,
    overrides: Partial<{
      name: string;
      summary: string;
      description: string;
      authorName: string;
      categoryId: string;
      sourceType: "INTERNAL" | "EXTERNAL";
      sourceUrl: string;
      sourceLabel: string;
      visibility: "ALL_USERS" | "PROJECT_MEMBERS" | "SPECIFIED_USERS";
      projectIds: string[];
      visibleUserIds: string[];
      changelog: string;
      fileName: string;
      fileBuffer: Buffer;
    }> = {},
  ) {
    const payload = {
      name: `Skill ${Date.now()}`,
      summary: "A short summary",
      description: "A full skill description",
      authorName: "系统管理员",
      categoryId,
      sourceType: "INTERNAL" as const,
      sourceUrl: "",
      sourceLabel: "",
      visibility: "ALL_USERS" as const,
      projectIds: [] as string[],
      visibleUserIds: [] as string[],
      changelog: "Initial release",
      fileName: `skill-${Date.now()}.zip`,
      fileBuffer: buildZipBuffer(),
      ...overrides,
    };

    const req = request(app.getHttpServer())
      .post("/skills")
      .set("Authorization", token)
      .field("name", payload.name)
      .field("summary", payload.summary)
      .field("description", payload.description)
      .field("authorName", payload.authorName)
      .field("categoryId", payload.categoryId)
      .field("sourceType", payload.sourceType)
      .field("visibility", payload.visibility)
      .field("projectIds", JSON.stringify(payload.projectIds))
      .field("visibleUserIds", JSON.stringify(payload.visibleUserIds))
      .field("changelog", payload.changelog);

    if (payload.sourceType === "EXTERNAL") {
      req.field("sourceUrl", payload.sourceUrl).field("sourceLabel", payload.sourceLabel);
    }

    return req.attach("packageFile", payload.fileBuffer, payload.fileName);
  }

  function createVersionRequest(
    token: string,
    skillId: string,
    overrides: Partial<{
      versionLabel: string;
      changelog: string;
      fileName: string;
      fileBuffer: Buffer;
    }> = {},
  ) {
    const payload = {
      versionLabel: "1.1.0",
      changelog: "Version update",
      fileName: `skill-version-${Date.now()}.zip`,
      fileBuffer: buildZipBuffer(),
      ...overrides,
    };

    return request(app.getHttpServer())
      .post(`/skills/${skillId}/versions`)
      .set("Authorization", token)
      .field("versionLabel", payload.versionLabel)
      .field("changelog", payload.changelog)
      .attach("packageFile", payload.fileBuffer, payload.fileName);
  }

  it("submits a skill draft with specified-user visibility", async () => {
    const response = await createSkillRequest(adminToken, {
        name: `Skill Submit ${Date.now()}`,
        categoryId,
        visibility: "SPECIFIED_USERS",
        visibleUserIds: [visibleUserId],
        fileName: "skill-submit.zip",
      })
      .expect(201);

    expect(response.body.data.status).toBe("PENDING_REVIEW");
    expect(response.body.data.visibility).toBe("SPECIFIED_USERS");
    expect(response.body.data.visibleUsers).toHaveLength(1);
  });

  it("rejects project-member visibility when no project is linked", async () => {
    const response = await createSkillRequest(adminToken, {
        name: `Skill Invalid ${Date.now()}`,
        categoryId,
        visibility: "PROJECT_MEMBERS",
        projectIds: [],
        fileName: "skill-invalid.zip",
      })
      .expect(400);

    expect(response.body.message).toContain("关联项目");
  });

  it("returns skill reference options for submitters without user or project admin permissions", async () => {
    const projectOptions = await request(app.getHttpServer())
      .get("/skills/options/projects")
      .set("Authorization", submitterToken)
      .expect(200);

    const userOptions = await request(app.getHttpServer())
      .get("/skills/options/users")
      .set("Authorization", submitterToken)
      .expect(200);

    expect(projectOptions.body.data.some((item: { id: string }) => item.id === projectId)).toBe(true);
    expect(userOptions.body.data.some((item: { id: string }) => item.id === visibleUserId)).toBe(true);
  });

  it("returns skill category options for library viewers without category admin permission", async () => {
    const response = await request(app.getHttpServer())
      .get("/skills/options/categories")
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(response.body.data.some((item: { id: string }) => item.id === categoryId)).toBe(true);
  });

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
      .field("projectIds", "[]")
      .field("visibleUserIds", "[]")
      .field("changelog", "Initial")
      .attach("packageFile", Buffer.from("PK\x03\x04"), "zip-skill.zip")
      .expect(201);

    expect(response.body.data.packageOriginalName).toBe("zip-skill.zip");
    expect(response.body.data.packageStoredName).toContain(response.body.data.id);
  });

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
      .field("projectIds", "[]")
      .field("visibleUserIds", "[]")
      .field("changelog", "Initial")
      .expect(400);
  });

  it("reviews and publishes a submitted skill", async () => {
    const created = await createSkillRequest(adminToken, {
        name: `Skill Flow ${Date.now()}`,
        summary: "Flow summary",
        description: "Flow description",
        categoryId,
        sourceType: "EXTERNAL",
        projectIds: [projectId],
        visibility: "PROJECT_MEMBERS",
        sourceUrl: "https://example.com/skill-flow",
        sourceLabel: "example.com",
        fileName: "skill-flow.zip",
      })
      .expect(201);

    const reviewed = await request(app.getHttpServer())
      .post(`/skills/${created.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({
        action: "APPROVE",
        comment: "Visibility is valid",
      })
      .expect(201);

    expect(reviewed.body.data.status).toBe("STORED");

    const published = await request(app.getHttpServer())
      .post(`/skills/${created.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    expect(published.body.data.status).toBe("PUBLISHED");

    const library = await request(app.getHttpServer())
      .get("/skills/library")
      .set("Authorization", adminToken)
      .expect(200);

    expect(
      library.body.data.some(
        (item: { id: string; status: string }) =>
          item.id === created.body.data.id && item.status === "PUBLISHED",
      ),
    ).toBe(true);
  });

  it("submits, reviews, and publishes a new version while preserving history", async () => {
    const initial = await createSkillRequest(adminToken, {
        name: `Skill Version ${Date.now()}`,
        summary: "Version summary",
        description: "Version description",
        categoryId,
        changelog: "Version 1.0.0",
        fileName: "skill-version-1.0.0.zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${initial.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({
        action: "APPROVE",
        comment: "Initial version approved",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${initial.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const nextVersion = await createVersionRequest(adminToken, initial.body.data.id, {
        versionLabel: "1.1.0",
        changelog: "Version 1.1.0",
        fileName: "skill-version-1.1.0.zip",
      })
      .expect(201);

    expect(nextVersion.body.data.versionLabel).toBe("1.1.0");
    expect(nextVersion.body.data.status).toBe("PENDING_REVIEW");

    const versionsBeforePublish = await request(app.getHttpServer())
      .get(`/skills/${initial.body.data.id}/versions`)
      .set("Authorization", adminToken)
      .expect(200);

    expect(versionsBeforePublish.body.data.map((item: { versionLabel: string }) => item.versionLabel)).toEqual([
      "1.1.0",
      "1.0.0",
    ]);

    await request(app.getHttpServer())
      .post(`/skills/${nextVersion.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({
        action: "APPROVE",
        comment: "Second version approved",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${nextVersion.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const library = await request(app.getHttpServer())
      .get("/skills/library")
      .set("Authorization", adminToken)
      .expect(200);

    const latest = library.body.data.find(
      (item: { name: string; versionLabel: string }) => item.name === initial.body.data.name,
    );

    expect(latest.versionLabel).toBe("1.1.0");

    const versionsAfterPublish = await request(app.getHttpServer())
      .get(`/skills/${initial.body.data.id}/versions`)
      .set("Authorization", adminToken)
      .expect(200);

    expect(versionsAfterPublish.body.data).toHaveLength(2);
    expect(
      versionsAfterPublish.body.data.some(
        (item: { versionLabel: string; status: string }) =>
          item.versionLabel === "1.0.0" && item.status === "PUBLISHED",
      ),
    ).toBe(true);
  });

  it("filters visible published skills by keyword, category, and source and returns details", async () => {
    const projectVisible = await createSkillRequest(adminToken, {
        name: `Project Search ${Date.now()}`,
        summary: "Project-visible summary",
        description: "Contains project keyword",
        categoryId,
        visibility: "PROJECT_MEMBERS",
        projectIds: [projectId],
        changelog: "Initial",
        fileName: "project-search.zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${projectVisible.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${projectVisible.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const specifiedVisible = await createSkillRequest(adminToken, {
        name: `Specified Search ${Date.now()}`,
        summary: "Specified-visible summary",
        description: "Contains specified keyword",
        categoryId: secondaryCategoryId,
        sourceType: "EXTERNAL",
        sourceUrl: "https://example.com/specified",
        sourceLabel: "example.com",
        visibility: "SPECIFIED_USERS",
        visibleUserIds: [visibleUserId],
        changelog: "Initial",
        fileName: "specified-search.zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${specifiedVisible.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${specifiedVisible.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const visibleLibrary = await request(app.getHttpServer())
      .get("/skills/library")
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(
      visibleLibrary.body.data.some((item: { id: string }) => item.id === projectVisible.body.data.id),
    ).toBe(true);
    expect(
      visibleLibrary.body.data.some((item: { id: string }) => item.id === specifiedVisible.body.data.id),
    ).toBe(false);

    const keywordFiltered = await request(app.getHttpServer())
      .get("/skills/library")
      .query({ keyword: "project keyword" })
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(keywordFiltered.body.data).toHaveLength(1);
    expect(keywordFiltered.body.data[0].id).toBe(projectVisible.body.data.id);

    const sourceFiltered = await request(app.getHttpServer())
      .get("/skills/library")
      .query({ sourceType: "INTERNAL", categoryId })
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(sourceFiltered.body.data.every((item: { sourceType: string; category: { id: string } }) =>
      item.sourceType === "INTERNAL" && item.category.id === categoryId,
    )).toBe(true);

    const detail = await request(app.getHttpServer())
      .get(`/skills/library/${projectVisible.body.data.id}`)
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(detail.body.data.id).toBe(projectVisible.body.data.id);
    expect(detail.body.data.description).toContain("project keyword");
    expect(detail.body.data.versions.length).toBeGreaterThanOrEqual(1);
  });

  it("downloads files and shows latest-version hints in personal history", async () => {
    const downloadable = await createSkillRequest(adminToken, {
        name: `Download Flow ${Date.now()}`,
        summary: "Download summary",
        description: "Download description",
        categoryId,
        visibility: "PROJECT_MEMBERS",
        projectIds: [projectId],
        changelog: "Version 1.0.0",
        fileName: "download-flow-1.0.0.zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${downloadable.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${downloadable.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const downloaded = await request(app.getHttpServer())
      .get(`/skills/${downloadable.body.data.id}/download`)
      .set("Authorization", libraryViewerToken)
      .buffer(true)
      .parse(parseBinary)
      .expect(200);
    expect(downloaded.headers["content-type"]).toContain("application/zip");
    expect(downloaded.headers["content-disposition"]).toContain("download-flow-1.0.0.zip");
    expect(downloaded.body.length).toBeGreaterThan(0);

    const nextVersion = await createVersionRequest(adminToken, downloadable.body.data.id, {
        versionLabel: "1.1.0",
        changelog: "Version 1.1.0",
        fileName: "download-flow-1.1.0.zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${nextVersion.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${nextVersion.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const historicalDownload = await request(app.getHttpServer())
      .get(`/skills/${downloadable.body.data.id}/download`)
      .query({ versionId: downloadable.body.data.id })
      .set("Authorization", libraryViewerToken)
      .buffer(true)
      .parse(parseBinary)
      .expect(200);

    expect(historicalDownload.headers["content-disposition"]).toContain("download-flow-1.0.0.zip");

    const history = await request(app.getHttpServer())
      .get("/skills/downloads/history")
      .set("Authorization", libraryViewerToken)
      .expect(200);

    const historyItem = history.body.data.find(
      (item: { seriesId: string }) => item.seriesId === downloadable.body.data.id,
    );

    expect(historyItem.latestPublishedVersion).toBe("1.1.0");
    expect(historyItem.lastDownloadedVersion).toBe("1.0.0");
    expect(historyItem.hasNewVersion).toBe(true);

    const records = await request(app.getHttpServer())
      .get("/skills/downloads/records")
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(
      records.body.data.some(
        (item: { seriesId: string; versionLabel: string; departmentName: string }) =>
          item.seriesId === downloadable.body.data.id &&
          item.versionLabel === "1.0.0" &&
          item.departmentName,
      ),
    ).toBe(true);
  });

  it("allows a downloaded user to create, update, and query skill ratings by series", async () => {
    const skill = await createSkillRequest(adminToken, {
      name: `Rating Flow ${Date.now()}`,
      summary: "Rating summary",
      description: "Rating description",
      categoryId,
      visibility: "PROJECT_MEMBERS",
      projectIds: [projectId],
      changelog: "Version 1.0.0",
      fileName: "rating-flow-1.0.0.zip",
    }).expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/downloads`)
      .set("Authorization", libraryViewerToken)
      .send({})
      .expect(201);

    const firstRating = await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", libraryViewerToken)
      .send({
        rating: 4,
        feedback: "上手快，示例清晰。",
      })
      .expect(201);

    expect(firstRating.body.data.rating).toBe(4);
    expect(firstRating.body.data.feedback).toBe("上手快，示例清晰。");
    expect(firstRating.body.data.seriesId).toBe(skill.body.data.id);

    const initialRatingId = firstRating.body.data.id;
    const initialCreatedAt = firstRating.body.data.createdAt;

    const updatedRating = await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", libraryViewerToken)
      .send({
        rating: 5,
        feedback: "二次体验更顺畅，值得推荐。",
      })
      .expect(201);

    expect(updatedRating.body.data.id).toBe(initialRatingId);
    expect(updatedRating.body.data.createdAt).toBe(initialCreatedAt);
    expect(updatedRating.body.data.rating).toBe(5);
    expect(updatedRating.body.data.feedback).toBe("二次体验更顺畅，值得推荐。");

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/downloads`)
      .set("Authorization", adminToken)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", adminToken)
      .send({
        rating: 3,
        feedback: "内容完整，但还可以补更多案例。",
      })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get(`/skills/${skill.body.data.id}/rating-summary`)
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(summary.body.data).toMatchObject({
      seriesId: skill.body.data.id,
      averageRating: 4,
      totalRatings: 2,
    });
    expect(summary.body.data.distribution).toEqual({
      1: 0,
      2: 0,
      3: 1,
      4: 0,
      5: 1,
    });

    const myRating = await request(app.getHttpServer())
      .get(`/skills/${skill.body.data.id}/rating/me`)
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(myRating.body.data).toMatchObject({
      seriesId: skill.body.data.id,
      raterId: libraryViewerId,
      rating: 5,
      feedback: "二次体验更顺畅，值得推荐。",
    });

    const ratings = await request(app.getHttpServer())
      .get(`/skills/${skill.body.data.id}/ratings`)
      .set("Authorization", libraryViewerToken)
      .expect(200);

    expect(ratings.body.data).toHaveLength(2);
    expect(ratings.body.data[0]).toMatchObject({
      seriesId: skill.body.data.id,
      rating: 3,
      feedback: "内容完整，但还可以补更多案例。",
      rater: {
        name: "系统管理员",
        departmentName: "总部",
      },
    });
    expect(ratings.body.data[1]).toMatchObject({
      seriesId: skill.body.data.id,
      rating: 5,
      feedback: "二次体验更顺畅，值得推荐。",
      rater: {
        name: "Skill Library Viewer",
        departmentName: "总部",
      },
    });
    expect(new Date(ratings.body.data[0].updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(ratings.body.data[1].updatedAt).getTime(),
    );

    const storedRatings = await prisma.skillRating.findMany({
      where: { seriesId: skill.body.data.id },
    });
    expect(storedRatings).toHaveLength(2);
  });

  it("rejects rating submission when the current user has not downloaded the skill series", async () => {
    const skill = await createSkillRequest(adminToken, {
      name: `Rating Guard ${Date.now()}`,
      summary: "Rating guard summary",
      description: "Rating guard description",
      categoryId,
      visibility: "PROJECT_MEMBERS",
      projectIds: [projectId],
      changelog: "Version 1.0.0",
      fileName: "rating-guard-1.0.0.zip",
    }).expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", libraryViewerToken)
      .send({
        rating: 2,
        feedback: "还没下载就想评分。",
      })
      .expect(400);

    expect(response.body.message).toContain("下载");
  });

  it("validates rating value and feedback content when submitting a skill rating", async () => {
    const skill = await createSkillRequest(adminToken, {
      name: `Rating Validation ${Date.now()}`,
      summary: "Rating validation summary",
      description: "Rating validation description",
      categoryId,
      visibility: "PROJECT_MEMBERS",
      projectIds: [projectId],
      changelog: "Version 1.0.0",
      fileName: "rating-validation-1.0.0.zip",
    }).expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/downloads`)
      .set("Authorization", libraryViewerToken)
      .send({})
      .expect(201);

    const invalidRating = await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", libraryViewerToken)
      .send({
        rating: 0,
        feedback: "评分越界。",
      })
      .expect(400);

    expect(String(invalidRating.body.message)).toContain("评分");

    const emptyFeedback = await request(app.getHttpServer())
      .post(`/skills/${skill.body.data.id}/rating`)
      .set("Authorization", libraryViewerToken)
      .send({
        rating: 4,
        feedback: "   ",
      })
      .expect(400);

    expect(String(emptyFeedback.body.message)).toContain("反馈内容不能为空");
  });
});

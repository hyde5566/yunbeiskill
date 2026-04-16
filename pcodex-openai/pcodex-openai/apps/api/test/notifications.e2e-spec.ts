import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("notifications", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let viewerToken: string;
  let otherToken: string;
  let rootDepartmentId: string;
  let notificationId: string;
  let otherNotificationId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: "admin", password: "Admin@123456" })
      .expect(201);

    adminToken = `Bearer ${adminLogin.body.data.accessToken}`;

    const rootDepartment = await prisma.department.findUnique({
      where: { code: "root" },
    });

    if (!rootDepartment) {
      throw new Error("root department not found");
    }

    rootDepartmentId = rootDepartment.id;

    const viewerAccount = `notification_viewer_${Date.now()}`;
    const viewerPassword = "Viewer@123456";

    const viewer = await prisma.user.create({
      data: {
        account: viewerAccount,
        name: "Notification Viewer",
        passwordHash: await bcrypt.hash(viewerPassword, 10),
        departmentId: rootDepartmentId,
        status: "ACTIVE",
      },
    });

    const otherAccount = `notification_other_${Date.now()}`;
    const otherPassword = "Other@123456";

    const otherUser = await prisma.user.create({
      data: {
        account: otherAccount,
        name: "Notification Other",
        passwordHash: await bcrypt.hash(otherPassword, 10),
        departmentId: rootDepartmentId,
        status: "ACTIVE",
      },
    });

    const viewerLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: viewerAccount, password: viewerPassword })
      .expect(201);

    viewerToken = `Bearer ${viewerLogin.body.data.accessToken}`;

    const otherLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ account: otherAccount, password: otherPassword })
      .expect(201);

    otherToken = `Bearer ${otherLogin.body.data.accessToken}`;

    const skillSeriesId = `notification-series-${Date.now()}`;

    const notification = await prisma.notification.create({
      data: {
        userId: viewer.id,
        type: "SKILL_VERSION_RELEASED",
        title: "Skill 新版本已发布",
        content: "请前往 Skill 详情查看最新版本。",
        skillSeriesId,
        skillId: `skill-${Date.now()}`,
        versionLabel: "1.1.0",
      },
    });

    notificationId = notification.id;

    const otherNotification = await prisma.notification.create({
      data: {
        userId: otherUser.id,
        type: "SKILL_VERSION_RELEASED",
        title: "Other 用户通知",
        content: "这条通知不该被 viewer 看见。",
        skillSeriesId: `${skillSeriesId}-other`,
        skillId: `skill-${Date.now()}-other`,
        versionLabel: "1.0.0",
      },
    });

    otherNotificationId = otherNotification.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  function buildZipBuffer() {
    return Buffer.from("PK\x03\x04notification-test");
  }

  async function getActiveSkillCategoryId() {
    const category = await prisma.skillCategory.findFirst({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (!category) {
      throw new Error("active skill category not found");
    }

    return category.id;
  }

  async function createReviewedSkillDraft(categoryId: string, projectId: string) {
    const skillName = `Notification Skill ${Date.now()}`;
    const initialSkill = await request(app.getHttpServer())
      .post("/skills")
      .set("Authorization", adminToken)
      .field("name", skillName)
      .field("summary", "Notification summary")
      .field("description", "Notification description")
      .field("authorName", "系统管理员")
      .field("categoryId", categoryId)
      .field("sourceType", "INTERNAL")
      .field("visibility", "PROJECT_MEMBERS")
      .field("projectIds", JSON.stringify([projectId]))
      .field("visibleUserIds", "[]")
      .field(
        "changelog",
        "第一版更新说明，用于验证首次发布不会发送通知。",
      )
      .attach("packageFile", buildZipBuffer(), "notification-skill-1.0.0.zip")
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${initialSkill.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({
        action: "APPROVE",
        comment: "Initial version approved",
      })
      .expect(201);

    return {
      initialSkillId: initialSkill.body.data.id,
      skillName,
    };
  }

  it("returns only the current user's notifications and supports isRead filtering", async () => {
    const list = await request(app.getHttpServer())
      .get("/notifications")
      .set("Authorization", viewerToken)
      .expect(200);

    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({
      id: notificationId,
      type: "SKILL_VERSION_RELEASED",
      title: "Skill 新版本已发布",
      content: "请前往 Skill 详情查看最新版本。",
      isRead: false,
      skillSeriesId: expect.any(String),
      skillId: expect.any(String),
      versionLabel: "1.1.0",
    });

    const unreadOnly = await request(app.getHttpServer())
      .get("/notifications")
      .query({ isRead: false })
      .set("Authorization", viewerToken)
      .expect(200);

    expect(unreadOnly.body.data).toHaveLength(1);

    const readOnly = await request(app.getHttpServer())
      .get("/notifications")
      .query({ isRead: true })
      .set("Authorization", viewerToken)
      .expect(200);

    expect(readOnly.body.data).toHaveLength(0);
  });

  it("returns notification detail for the current user only", async () => {
    const detail = await request(app.getHttpServer())
      .get(`/notifications/${notificationId}`)
      .set("Authorization", viewerToken)
      .expect(200);

    expect(detail.body.data).toMatchObject({
      id: notificationId,
      isRead: false,
      title: "Skill 新版本已发布",
    });
  });

  it("marks a notification as read idempotently", async () => {
    const readFirst = await request(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set("Authorization", viewerToken)
      .expect(200);

    expect(readFirst.body.data).toMatchObject({
      id: notificationId,
      isRead: true,
    });

    const readSecond = await request(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set("Authorization", viewerToken)
      .expect(200);

    expect(readSecond.body.data).toMatchObject({
      id: notificationId,
      isRead: true,
    });
  });

  it("does not expose another user's notification", async () => {
    await request(app.getHttpServer())
      .get(`/notifications/${otherNotificationId}`)
      .set("Authorization", viewerToken)
      .expect(404);
  });

  it("does not allow marking another user's notification as read", async () => {
    await request(app.getHttpServer())
      .patch(`/notifications/${otherNotificationId}/read`)
      .set("Authorization", viewerToken)
      .expect(404);
  });

  it("creates skill release notifications only for active downloader users on subsequent publishes", async () => {
    const categoryId = await getActiveSkillCategoryId();
    const project = await prisma.project.create({
      data: {
        name: `notification-project-${Date.now()}`,
        description: "notification project",
        status: "ACTIVE",
      },
    });

    const activeFirst = await prisma.user.create({
      data: {
        account: `notification_active_first_${Date.now()}`,
        name: "Notification Active First",
        passwordHash: await bcrypt.hash("Active@123456", 10),
        departmentId: rootDepartmentId,
        status: "ACTIVE",
      },
    });

    const activeSecond = await prisma.user.create({
      data: {
        account: `notification_active_second_${Date.now()}`,
        name: "Notification Active Second",
        passwordHash: await bcrypt.hash("Active2@123456", 10),
        departmentId: rootDepartmentId,
        status: "ACTIVE",
      },
    });

    const inactiveUser = await prisma.user.create({
      data: {
        account: `notification_inactive_${Date.now()}`,
        name: "Notification Inactive",
        passwordHash: await bcrypt.hash("Inactive@123456", 10),
        departmentId: rootDepartmentId,
        status: "DISABLED",
      },
    });

    const { initialSkillId, skillName } = await createReviewedSkillDraft(categoryId, project.id);

    await prisma.skillDownloadRecord.createMany({
      data: [
        {
          skillId: initialSkillId,
          seriesId: initialSkillId,
          downloaderId: activeFirst.id,
          departmentId: rootDepartmentId,
          departmentName: "总部",
          skillName,
          versionLabel: "1.0.0",
        },
        {
          skillId: initialSkillId,
          seriesId: initialSkillId,
          downloaderId: activeFirst.id,
          departmentId: rootDepartmentId,
          departmentName: "总部",
          skillName,
          versionLabel: "1.0.0",
        },
        {
          skillId: initialSkillId,
          seriesId: initialSkillId,
          downloaderId: activeSecond.id,
          departmentId: rootDepartmentId,
          departmentName: "总部",
          skillName,
          versionLabel: "1.0.0",
        },
        {
          skillId: initialSkillId,
          seriesId: initialSkillId,
          downloaderId: inactiveUser.id,
          departmentId: rootDepartmentId,
          departmentName: "总部",
          skillName,
          versionLabel: "1.0.0",
        },
      ],
    });

    await request(app.getHttpServer())
      .post(`/skills/${initialSkillId}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const afterFirstPublish = await prisma.notification.findMany({
      where: { skillSeriesId: initialSkillId },
      orderBy: { createdAt: "asc" },
    });

    expect(afterFirstPublish).toHaveLength(0);

    const secondVersion = await request(app.getHttpServer())
      .post(`/skills/${initialSkillId}/versions`)
      .set("Authorization", adminToken)
      .field("versionLabel", "1.1.0")
      .field("changelog", "第二版更新说明，包含更完整的示例、修复和优化，用于验证通知摘要内容是否正确。")
      .attach("packageFile", buildZipBuffer(), "notification-skill-1.1.0.zip")
      .expect(201);

    expect(secondVersion.body.data.versionLabel).toBe("1.1.0");

    await request(app.getHttpServer())
      .post(`/skills/${secondVersion.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({
        action: "APPROVE",
        comment: "Second version approved",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${secondVersion.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const notifications = await prisma.notification.findMany({
      where: { skillSeriesId: initialSkillId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    expect(notifications).toHaveLength(2);
    expect(new Set(notifications.map((item) => item.userId))).toEqual(
      new Set([activeFirst.id, activeSecond.id]),
    );
    expect(notifications.every((item) => item.type === "SKILL_VERSION_RELEASED")).toBe(true);
    expect(
      notifications.every(
        (item) =>
          item.title.includes(skillName) &&
          item.title.includes("1.1.0") &&
          item.content.includes(skillName) &&
          item.content.includes("1.1.0") &&
          item.content.includes("更新说明"),
      ),
    ).toBe(true);
    expect(notifications.some((item) => item.userId === inactiveUser.id)).toBe(false);
    expect(notifications.filter((item) => item.userId === activeFirst.id)).toHaveLength(1);
  });
});

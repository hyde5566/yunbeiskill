import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("logs", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let departmentId: string;
  let roleId: string;
  let categoryId: string;

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

    const rootDepartment = await prisma.department.findUnique({
      where: { code: "root" },
    });
    const adminRole = await prisma.role.findUnique({
      where: { code: "super-admin" },
    });

    if (!rootDepartment || !adminRole) {
      throw new Error("seed data not found");
    }

    departmentId = rootDepartment.id;
    roleId = adminRole.id;
    const category = await prisma.skillCategory.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    });

    if (!category) {
      throw new Error("active skill category not found");
    }

    categoryId = category.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("stores user creation operations and exposes login logs", async () => {
    const createdUser = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account: `bob_${Date.now()}`,
        name: "Bob",
        password: "Bob@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    const operationLogs = await request(app.getHttpServer())
      .get("/operation-logs")
      .set("Authorization", adminToken)
      .expect(200);

    const createdUserLog = operationLogs.body.data.find(
      (item: { module: string; operationType: string; targetId: string }) =>
        item.module === "users" &&
        item.operationType === "create" &&
        item.targetId === createdUser.body.data.id,
    );

    expect(createdUserLog).toBeDefined();

    const loginLogs = await request(app.getHttpServer())
      .get("/login-logs")
      .set("Authorization", adminToken)
      .expect(200);

    const adminLoginLog = loginLogs.body.data.find((item: { account: string }) => item.account === "admin");

    expect(adminLoginLog).toBeDefined();
    if (!adminLoginLog) {
      throw new Error("admin login log not found");
    }
    expect(["SUCCESS", "FAILURE"]).toContain(adminLoginLog.result);
  });

  it("stores separate operation logs for creating and updating a skill rating", async () => {
    const zipBuffer = Buffer.from("PK\x03\x04skill-log-test");
    const createdSkill = await request(app.getHttpServer())
      .post("/skills")
      .set("Authorization", adminToken)
      .field("name", `Rating Log Skill ${Date.now()}`)
      .field("summary", "rating log summary")
      .field("description", "rating log description")
      .field("authorName", "系统管理员")
      .field("categoryId", categoryId)
      .field("sourceType", "INTERNAL")
      .field("visibility", "ALL_USERS")
      .field("projectIds", JSON.stringify([]))
      .field("visibleUserIds", JSON.stringify([]))
      .field("changelog", "Version 1.0.0")
      .attach("packageFile", zipBuffer, {
        filename: "rating-log.zip",
        contentType: "application/zip",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${createdSkill.body.data.id}/review`)
      .set("Authorization", adminToken)
      .send({ action: "APPROVE", comment: "ok" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/skills/${createdSkill.body.data.id}/publish`)
      .set("Authorization", adminToken)
      .expect(201);

    const downloadRecord = await request(app.getHttpServer())
      .post(`/skills/${createdSkill.body.data.id}/downloads`)
      .set("Authorization", adminToken)
      .send({})
      .expect(201);

    expect(downloadRecord.body.data.seriesId).toBe(createdSkill.body.data.id);

    const firstRating = await request(app.getHttpServer())
      .post(`/skills/${createdSkill.body.data.id}/rating`)
      .set("Authorization", adminToken)
      .send({
        rating: 4,
        feedback: "第一次评分",
      })
      .expect(201);

    const updatedRating = await request(app.getHttpServer())
      .post(`/skills/${createdSkill.body.data.id}/rating`)
      .set("Authorization", adminToken)
      .send({
        rating: 5,
        feedback: "第二次评分",
      })
      .expect(201);

    expect(updatedRating.body.data.id).toBe(firstRating.body.data.id);

    const operationLogs = await request(app.getHttpServer())
      .get("/operation-logs")
      .set("Authorization", adminToken)
      .expect(200);

    const ratingLogs = operationLogs.body.data.filter(
      (item: { module: string; targetId: string; operationType: string }) =>
        item.module === "skills" && item.targetId === firstRating.body.data.id,
    );

    expect(ratingLogs.some((item: { operationType: string }) => item.operationType === "rate-create")).toBe(true);
    expect(ratingLogs.some((item: { operationType: string }) => item.operationType === "rate-update")).toBe(true);
  });
});

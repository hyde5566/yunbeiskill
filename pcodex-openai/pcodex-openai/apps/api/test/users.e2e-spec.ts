import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("users", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let departmentId: string;
  let roleId: string;
  let alternateDepartmentId: string;
  let alternateRoleId: string;

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

    const alternateDepartment = await prisma.department.upsert({
      where: { code: "qa-center" },
      update: {},
      create: {
        code: "qa-center",
        name: "测试中心",
        status: "ACTIVE",
      },
    });

    const alternateRole = await prisma.role.upsert({
      where: { code: "qa-member" },
      update: {},
      create: {
        code: "qa-member",
        name: "测试成员",
        status: "ACTIVE",
      },
    });

    alternateDepartmentId = alternateDepartment.id;
    alternateRoleId = alternateRole.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("creates a user and assigns roles", async () => {
    const account = `alice_${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account,
        name: "Alice",
        password: "Alice@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    expect(response.body.data.account).toBe(account);
    expect(response.body.data.roles).toHaveLength(1);
  });

  it("updates a user profile", async () => {
    const account = `bob_${Date.now()}`;
    const createdUser = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account,
        name: "Bob",
        password: "Bob@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/users/${createdUser.body.data.id}`)
      .set("Authorization", adminToken)
      .send({
        name: "Bob QA",
        departmentId: alternateDepartmentId,
      })
      .expect(200);

    expect(response.body.data.name).toBe("Bob QA");
    expect(response.body.data.department.id).toBe(alternateDepartmentId);
    expect(response.body.data.roles).toEqual([
      expect.objectContaining({ id: roleId, name: "超级管理员" }),
    ]);
  });

  it("reassigns user roles", async () => {
    const account = `david_${Date.now()}`;
    const createdUser = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account,
        name: "David",
        password: "David@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/users/${createdUser.body.data.id}/roles`)
      .set("Authorization", adminToken)
      .send({
        roleIds: [alternateRoleId],
      })
      .expect(200);

    expect(response.body.data.roles).toEqual([
      expect.objectContaining({ id: alternateRoleId, name: "测试成员" }),
    ]);
  });

  it("toggles a user status", async () => {
    const account = `cindy_${Date.now()}`;
    const createdUser = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account,
        name: "Cindy",
        password: "Cindy@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    const disableResponse = await request(app.getHttpServer())
      .patch(`/users/${createdUser.body.data.id}/status`)
      .set("Authorization", adminToken)
      .send({ status: "DISABLED" })
      .expect(200);

    expect(disableResponse.body.data.status).toBe("DISABLED");

    const enableResponse = await request(app.getHttpServer())
      .patch(`/users/${createdUser.body.data.id}/status`)
      .set("Authorization", adminToken)
      .send({ status: "ACTIVE" })
      .expect(200);

    expect(enableResponse.body.data.status).toBe("ACTIVE");
  });

  it("deletes a user", async () => {
    const account = `eva_${Date.now()}`;
    const createdUser = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", adminToken)
      .send({
        account,
        name: "Eva",
        password: "Eva@123456",
        departmentId,
        roleIds: [roleId],
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/users/${createdUser.body.data.id}`)
      .set("Authorization", adminToken)
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", adminToken)
      .expect(200);

    expect(listResponse.body.data).not.toContainEqual(
      expect.objectContaining({ account }),
    );
  });
});

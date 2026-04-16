import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("roles", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;

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
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("creates a role with selected permissions", async () => {
    const response = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", adminToken)
      .send({
        name: "项目管理员",
        permissionCodes: ["project.view", "project.edit", "project.member.add"],
      })
      .expect(201);

    expect(response.body.data.code).toMatch(/^role-\d{13}-[a-z0-9]{4}$/);
    expect(response.body.data.permissionCodes).toContain("project.member.add");
  });

  it("updates a role and its permission bindings", async () => {
    const createdRole = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", adminToken)
      .send({
        name: "初始角色",
        permissionCodes: ["project.view"],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/roles/${createdRole.body.data.id}`)
      .set("Authorization", adminToken)
      .send({
        name: "更新后的角色",
        description: "用于更新测试",
        permissionCodes: ["project.view", "project.edit", "project.member.add"],
      })
      .expect(200);

    expect(response.body.data.name).toBe("更新后的角色");
    expect(response.body.data.permissionCodes).toEqual([
      "project.view",
      "project.edit",
      "project.member.add",
    ]);
  });

  it("deletes an unused role", async () => {
    const createdRole = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", adminToken)
      .send({
        name: "待删除角色",
        permissionCodes: ["role.view"],
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/roles/${createdRole.body.data.id}`)
      .set("Authorization", adminToken)
      .expect(200);
  });
});

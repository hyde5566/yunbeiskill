import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("departments", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let rootDepartmentId: string;

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

    if (!rootDepartment) {
      throw new Error("root department not found");
    }

    rootDepartmentId = rootDepartment.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("prevents deleting a department that still has users", async () => {
    await request(app.getHttpServer())
      .delete(`/departments/${rootDepartmentId}`)
      .set("Authorization", adminToken)
      .expect(400);
  });

  it("updates a department profile", async () => {
    const createdDepartment = await request(app.getHttpServer())
      .post("/departments")
      .set("Authorization", adminToken)
      .send({
        name: "运营中心",
        sortOrder: 5,
      })
      .expect(201);

    expect(createdDepartment.body.data.code).toContain("dept-");

    const response = await request(app.getHttpServer())
      .patch(`/departments/${createdDepartment.body.data.id}`)
      .set("Authorization", adminToken)
      .send({
        name: "运营支持中心",
        sortOrder: 8,
        parentId: rootDepartmentId,
      })
      .expect(200);

    expect(response.body.data.name).toBe("运营支持中心");
    expect(response.body.data.sortOrder).toBe(8);
    expect(response.body.data.parentId).toBe(rootDepartmentId);
  });
});

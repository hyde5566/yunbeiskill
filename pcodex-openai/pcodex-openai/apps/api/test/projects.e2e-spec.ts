import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("projects", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let seedUserId: string;

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

    const user = await prisma.user.findUnique({
      where: { account: "admin" },
    });

    if (!user) {
      throw new Error("admin user not found");
    }

    seedUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("adds and removes project members", async () => {
    const project = await request(app.getHttpServer())
      .post("/projects")
      .set("Authorization", adminToken)
      .send({ name: `Alpha-${Date.now()}`, description: "First project" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/projects/${project.body.data.id}/members`)
      .set("Authorization", adminToken)
      .send({ userIds: [seedUserId] })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/projects/${project.body.data.id}/members/${seedUserId}`)
      .set("Authorization", adminToken)
      .expect(200);
  });

  it("updates and deletes a project", async () => {
    const createdProject = await request(app.getHttpServer())
      .post("/projects")
      .set("Authorization", adminToken)
      .send({ name: `Beta-${Date.now()}`, description: "Original description" })
      .expect(201);

    const updatedProject = await request(app.getHttpServer())
      .patch(`/projects/${createdProject.body.data.id}`)
      .set("Authorization", adminToken)
      .send({
        name: `Beta-Updated-${Date.now()}`,
        description: "Updated description",
      })
      .expect(200);

    expect(updatedProject.body.data.description).toBe("Updated description");

    await request(app.getHttpServer())
      .delete(`/projects/${createdProject.body.data.id}`)
      .set("Authorization", adminToken)
      .expect(200);
  });
});

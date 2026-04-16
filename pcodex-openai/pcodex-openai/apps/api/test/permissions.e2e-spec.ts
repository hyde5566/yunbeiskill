import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("permissions", () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
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
  });

  it("lists available functional permissions", async () => {
    const response = await request(app.getHttpServer())
      .get("/permissions")
      .set("Authorization", adminToken)
      .expect(200);

    expect(response.body.data).toContainEqual(
      expect.objectContaining({ code: "user.view" }),
    );
    expect(response.body.data).toContainEqual(
      expect.objectContaining({ code: "user.delete", module: "用户管理", name: "删除用户" }),
    );
    expect(response.body.data).toContainEqual(
      expect.objectContaining({ code: "log.export" }),
    );
  });
});

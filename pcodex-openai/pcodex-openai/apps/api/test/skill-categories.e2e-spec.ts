import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("skill categories", () => {
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

  it("lists the seeded seven skill categories in sort order", async () => {
    const response = await request(app.getHttpServer())
      .get("/skill-categories")
      .set("Authorization", adminToken)
      .expect(200);

    expect(response.body.data.map((item: { name: string }) => item.name)).toEqual([
      "AI智能",
      "开发工具",
      "效率提升",
      "数据分析",
      "内容创作",
      "安全合规",
      "通讯协作",
    ]);
  });
});

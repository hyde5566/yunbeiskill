import fs from "node:fs";
import path from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const skillStorageDir =
    process.env.SKILL_STORAGE_DIR ??
    path.resolve(process.cwd(), "..", "..", "storage", "skills");

  fs.mkdirSync(skillStorageDir, { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}

bootstrap();

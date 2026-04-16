import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Test } from "@nestjs/testing";
import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import {
  type SkillStorageFileInput,
  SkillStorageService,
} from "../src/modules/skills/storage/skill-storage.service";

describe("skill storage service", () => {
  let storageDir: string;
  let service: SkillStorageService;

  beforeEach(async () => {
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), "yunbei-skill-storage-"));
    process.env.SKILL_STORAGE_DIR = storageDir;

    const moduleRef = await Test.createTestingModule({
      providers: [SkillStorageService],
    }).compile();

    service = moduleRef.get(SkillStorageService);
  });

  afterEach(async () => {
    await fs.rm(storageDir, { recursive: true, force: true });
    delete process.env.SKILL_STORAGE_DIR;
  });

  it("accepts zip files up to 50MB and returns persisted metadata", async () => {
    const result = await service.saveSkillPackage({
      skillId: "skill-1",
      file: {
        originalname: "helper.zip",
        mimetype: "application/zip",
        size: 1024,
        buffer: Buffer.from("zip"),
      } satisfies SkillStorageFileInput,
    });

    expect(result.originalName).toBe("helper.zip");
    expect(result.storedName).toMatch(/^skill-1_/);
    expect(result.relativePath).toContain("skills");
    expect(result.mimeType).toBe("application/zip");
    expect(result.sizeBytes).toBe(1024);
    expect(result.checksum).toHaveLength(64);
  });

  it("rejects non-zip files", async () => {
    await expect(
      service.saveSkillPackage({
        skillId: "skill-1",
        file: {
        originalname: "helper.txt",
        mimetype: "text/plain",
        size: 8,
        buffer: Buffer.from("bad"),
        } satisfies SkillStorageFileInput,
      }),
    ).rejects.toThrow("仅支持上传 Zip 包");
  });
});

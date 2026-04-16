import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

export interface SkillStorageFileInput {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface StoredSkillPackage {
  originalName: string;
  storedName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  uploadedAt: Date;
}

const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024;

@Injectable()
export class SkillStorageService {
  private readonly storageDir =
    process.env.SKILL_STORAGE_DIR ??
    path.resolve(process.cwd(), "..", "..", "storage", "skills");

  async saveSkillPackage(input: { skillId: string; file: SkillStorageFileInput }): Promise<StoredSkillPackage> {
    this.validateZipFile(input.file);

    await fs.mkdir(this.storageDir, { recursive: true });

    const uploadedAt = new Date();
    const extension = path.extname(input.file.originalname).toLowerCase() || ".zip";
    const storedName = `${input.skillId}_${uploadedAt.getTime()}_${randomUUID().replace(/-/g, "")}${extension}`;
    const absolutePath = path.join(this.storageDir, storedName);
    const checksum = createHash("sha256").update(input.file.buffer).digest("hex");

    await fs.writeFile(absolutePath, input.file.buffer);

    return {
      originalName: input.file.originalname,
      storedName,
      relativePath: path.posix.join("skills", storedName),
      mimeType: "application/zip",
      sizeBytes: input.file.size,
      checksum,
      uploadedAt,
    };
  }

  async openReadStream(relativePath: string) {
    const absolutePath = this.resolveAbsolutePath(relativePath);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new NotFoundException("文件不存在，请联系管理员重新上传");
    }

    return createReadStream(absolutePath);
  }

  async removeStoredFile(relativePath: string) {
    const absolutePath = this.resolveAbsolutePath(relativePath);
    await fs.rm(absolutePath, { force: true });
  }

  private validateZipFile(file: SkillStorageFileInput) {
    if (!file.originalname.toLowerCase().endsWith(".zip")) {
      throw new BadRequestException("仅支持上传 Zip 包");
    }

    if (file.size > MAX_ZIP_SIZE_BYTES) {
      throw new BadRequestException("Zip 包大小不能超过 50MB");
    }
  }

  private resolveAbsolutePath(relativePath: string) {
    const normalized = relativePath.replace(/\\/g, "/");
    const storedName = normalized.startsWith("skills/")
      ? normalized.slice("skills/".length)
      : path.posix.basename(normalized);
    const absolutePath = path.resolve(this.storageDir, storedName);

    if (!absolutePath.startsWith(path.resolve(this.storageDir))) {
      throw new BadRequestException("文件路径非法");
    }

    return absolutePath;
  }
}

import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import { SkillSourceType, SkillVisibility } from "@prisma/client";

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseStringArray(item));
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export class CreateSkillDto {
  @IsString()
  name!: string;

  @IsString()
  summary!: string;

  @IsString()
  description!: string;

  @IsString()
  authorName!: string;

  @IsString()
  categoryId!: string;

  @IsEnum(SkillSourceType)
  sourceType!: SkillSourceType;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string | null;

  @IsOptional()
  @IsString()
  sourceLabel?: string | null;

  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  projectIds!: string[];

  @IsEnum(SkillVisibility)
  visibility!: SkillVisibility;

  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  visibleUserIds!: string[];

  @IsString()
  changelog!: string;
}

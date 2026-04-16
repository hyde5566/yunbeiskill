import { IsOptional, IsString } from "class-validator";

export class DownloadSkillDto {
  @IsOptional()
  @IsString()
  versionId?: string;
}

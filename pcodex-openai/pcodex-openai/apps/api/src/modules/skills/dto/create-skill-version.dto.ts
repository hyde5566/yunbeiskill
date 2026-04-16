import { IsString, Matches } from "class-validator";

export class CreateSkillVersionDto {
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: "版本号必须为语义化版本格式，例如 1.1.0",
  })
  versionLabel!: string;

  @IsString()
  changelog!: string;
}

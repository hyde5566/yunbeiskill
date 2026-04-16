import { Transform } from "class-transformer";
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";

export class SubmitSkillRatingDto {
  @Transform(({ value }) => Number(value))
  @IsInt({ message: "评分必须为整数" })
  @Min(1, { message: "评分最低为1分" })
  @Max(5, { message: "评分最高为5分" })
  rating!: number;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: "反馈内容不能为空" })
  feedback!: string;
}

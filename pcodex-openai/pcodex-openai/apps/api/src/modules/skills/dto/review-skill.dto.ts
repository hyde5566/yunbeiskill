import { IsEnum, IsOptional, IsString } from "class-validator";

export enum SkillReviewAction {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export class ReviewSkillDto {
  @IsEnum(SkillReviewAction)
  action!: SkillReviewAction;

  @IsOptional()
  @IsString()
  comment?: string;
}

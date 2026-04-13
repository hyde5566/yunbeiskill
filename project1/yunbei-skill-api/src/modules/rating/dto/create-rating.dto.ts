import { IsNumber, IsNotEmpty, Min, Max, IsOptional } from 'class-validator'

export class CreateRatingDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Skill ID不能为空' })
  skillId: number

  @IsNumber()
  @IsOptional()
  versionId?: number

  @IsNumber()
  @Min(1, { message: '评分最小为1' })
  @Max(5, { message: '评分最大为5' })
  @IsNotEmpty({ message: '评分不能为空' })
  score: number
}
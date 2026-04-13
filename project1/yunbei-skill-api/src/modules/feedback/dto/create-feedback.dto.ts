import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class CreateFeedbackDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Skill ID不能为空' })
  skillId: number

  @IsNumber()
  @IsOptional()
  versionId?: number

  @IsString()
  @IsNotEmpty({ message: '反馈内容不能为空' })
  content: string
}
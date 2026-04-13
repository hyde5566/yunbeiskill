import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFeedbackDto {
  @ApiProperty({ description: 'SkillID' })
  @IsNotEmpty()
  @IsInt()
  skill_id: number

  @ApiPropertyOptional({ description: '版本ID' })
  @IsOptional()
  @IsInt()
  version_id?: number

  @ApiProperty({ description: '反馈内容' })
  @IsNotEmpty({ message: '反馈内容不能为空' })
  @IsString()
  content: string
}

export class MarkInvalidDto {
  @ApiProperty({ description: '是否无效（0=正常，1=无效）' })
  @IsNotEmpty()
  @IsInt()
  is_invalid: number
}

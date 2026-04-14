import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateFeedbackDto {
  @ApiProperty({ description: 'SkillID' })
  @IsNotEmpty()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  skill_id: number

  @ApiPropertyOptional({ description: '版本ID' })
  @IsOptional()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
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

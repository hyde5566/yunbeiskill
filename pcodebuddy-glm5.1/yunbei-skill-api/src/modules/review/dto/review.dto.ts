import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class AssignReviewerDto {
  @ApiProperty({ description: 'SkillID' })
  @IsNotEmpty()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @IsNotEmpty()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  version_id: number

  @ApiProperty({ description: '审核员ID' })
  @IsNotEmpty()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  reviewer_id: number
}

export class ReviewActionDto {
  @ApiProperty({ description: '审核结果（approved/rejected）' })
  @IsNotEmpty()
  @IsEnum(['approved', 'rejected'])
  status: string

  @ApiPropertyOptional({ description: '审核意见' })
  @IsOptional()
  @IsString()
  comment?: string
}

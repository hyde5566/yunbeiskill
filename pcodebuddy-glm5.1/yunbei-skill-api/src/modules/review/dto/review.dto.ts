import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AssignReviewerDto {
  @ApiProperty({ description: 'SkillID' })
  @IsNotEmpty()
  @IsInt()
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @IsNotEmpty()
  @IsInt()
  version_id: number

  @ApiProperty({ description: '审核员ID' })
  @IsNotEmpty()
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

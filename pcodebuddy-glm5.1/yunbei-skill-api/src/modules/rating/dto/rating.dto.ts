import { IsNotEmpty, IsInt, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRatingDto {
  @ApiProperty({ description: 'SkillID' })
  @IsNotEmpty()
  @IsInt()
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @IsNotEmpty()
  @IsInt()
  version_id: number

  @ApiProperty({ description: '评分（1-5）' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  score: number
}

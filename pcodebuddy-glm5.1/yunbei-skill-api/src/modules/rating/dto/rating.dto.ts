import { IsNotEmpty, IsInt, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateRatingDto {
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

  @ApiProperty({ description: '评分（1-5）' })
  @IsNotEmpty()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number
}

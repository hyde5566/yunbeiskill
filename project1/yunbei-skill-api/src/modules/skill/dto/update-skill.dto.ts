import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  description?: string | null

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  detailDescription?: string | null

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  author?: string | null

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number

  @IsOptional()
  @IsEnum(['internal', 'external'])
  sourceType?: string

  @IsOptional()
  @IsString()
  sourceName?: string | null

  @IsOptional()
  @IsEnum(['all', 'project', 'account'])
  visibilityType?: string

  @Transform(({ value }) => {
    if (!value) return []
    if (typeof value === 'string') return value.split(',').map(Number)
    return value
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  visibilityTargets?: number[]
}
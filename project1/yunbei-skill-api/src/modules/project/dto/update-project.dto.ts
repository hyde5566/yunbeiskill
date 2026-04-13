import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  description?: string | null

  @Transform(({ value }) => {
    if (!value) return []
    if (typeof value === 'string') return value.split(',').map(Number)
    return value
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  memberIds?: number[]
}
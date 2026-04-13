import { IsString, IsOptional, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
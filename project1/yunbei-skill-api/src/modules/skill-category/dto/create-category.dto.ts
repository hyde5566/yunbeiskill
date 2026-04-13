import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
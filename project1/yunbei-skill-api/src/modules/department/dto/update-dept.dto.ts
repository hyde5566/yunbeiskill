import { IsString, IsOptional, IsNumber } from 'class-validator'

export class UpdateDeptDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsNumber()
  parentId?: number

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
import { IsString, IsNotEmpty, IsOptional, IsNumber, Allow } from 'class-validator'

export class CreateDeptDto {
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  name: string

  @IsOptional()
  @Allow()
  parentId?: number | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
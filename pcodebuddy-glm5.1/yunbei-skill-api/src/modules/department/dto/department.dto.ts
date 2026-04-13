import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  @IsNotEmpty({ message: '部门名称不能为空' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '父部门ID' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  parent_id?: number

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  sort_order?: number
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '父部门ID' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  parent_id?: number

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  sort_order?: number
}

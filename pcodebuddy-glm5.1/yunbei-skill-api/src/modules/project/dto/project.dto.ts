import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '项目负责人ID' })
  @IsNotEmpty({ message: '项目负责人不能为空' })
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  owner_id: number
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: '项目名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '项目负责人ID' })
  @IsOptional()
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  owner_id?: number

  @ApiPropertyOptional({ description: '状态（active/archived）' })
  @IsOptional()
  @IsString()
  status?: string
}

export class AddProjectMembersDto {
  @ApiProperty({ description: '用户ID列表' })
  @IsNotEmpty({ message: '用户列表不能为空' })
  @IsArray()
  user_ids: number[]
}

export class AddProjectSkillDto {
  @ApiProperty({ description: 'SkillID列表' })
  @IsNotEmpty({ message: 'Skill列表不能为空' })
  @IsArray()
  skill_ids: number[]
}

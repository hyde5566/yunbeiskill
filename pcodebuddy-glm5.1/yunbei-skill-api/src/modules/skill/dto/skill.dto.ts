import { IsNotEmpty, IsString, IsInt, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSkillDto {
  @ApiProperty({ description: 'Skill名称' })
  @IsNotEmpty({ message: 'Skill名称不能为空' })
  @IsString()
  name: string

  @ApiProperty({ description: '简介' })
  @IsNotEmpty({ message: '简介不能为空' })
  @IsString()
  summary: string

  @ApiProperty({ description: '详细说明' })
  @IsNotEmpty({ message: '详细说明不能为空' })
  @IsString()
  detail: string

  @ApiProperty({ description: '作者' })
  @IsNotEmpty({ message: '作者不能为空' })
  @IsString()
  author: string

  @ApiProperty({ description: '分类ID' })
  @IsNotEmpty({ message: '分类不能为空' })
  @IsInt()
  category_id: number

  @ApiProperty({ description: '来源类型（internal/external）' })
  @IsNotEmpty({ message: '来源类型不能为空' })
  @IsEnum(['internal', 'external'])
  source_type: string

  @ApiPropertyOptional({ description: '来源网址（外部平台时必填）' })
  @IsOptional()
  @IsString()
  source_url?: string

  @ApiPropertyOptional({ description: '来源网址名称' })
  @IsOptional()
  @IsString()
  source_url_name?: string

  @ApiPropertyOptional({ description: '关联项目ID列表' })
  @IsOptional()
  @IsArray()
  project_ids?: number[]

  @ApiProperty({ description: '可见范围类型（all/project/account）' })
  @IsNotEmpty({ message: '可见范围不能为空' })
  @IsEnum(['all', 'project', 'account'])
  visibility_type: string

  @ApiPropertyOptional({ description: '可见账号ID列表（指定账号可见时必填）' })
  @IsOptional()
  @IsArray()
  visibility_account_ids?: number[]

  @ApiProperty({ description: '版本号' })
  @IsNotEmpty({ message: '版本号不能为空' })
  @IsString()
  version_number: string

  @ApiProperty({ description: '更新说明' })
  @IsNotEmpty({ message: '更新说明不能为空' })
  @IsString()
  change_log: string
}

export class UpdateSkillDto {
  @ApiPropertyOptional({ description: 'Skill名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '简介' })
  @IsOptional()
  @IsString()
  summary?: string

  @ApiPropertyOptional({ description: '详细说明' })
  @IsOptional()
  @IsString()
  detail?: string

  @ApiPropertyOptional({ description: '作者' })
  @IsOptional()
  @IsString()
  author?: string

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsInt()
  category_id?: number

  @ApiPropertyOptional({ description: '来源类型' })
  @IsOptional()
  @IsEnum(['internal', 'external'])
  source_type?: string

  @ApiPropertyOptional({ description: '来源网址' })
  @IsOptional()
  @IsString()
  source_url?: string

  @ApiPropertyOptional({ description: '来源网址名称' })
  @IsOptional()
  @IsString()
  source_url_name?: string

  @ApiPropertyOptional({ description: '关联项目ID列表' })
  @IsOptional()
  @IsArray()
  project_ids?: number[]

  @ApiPropertyOptional({ description: '可见范围类型' })
  @IsOptional()
  @IsEnum(['all', 'project', 'account'])
  visibility_type?: string

  @ApiPropertyOptional({ description: '可见账号ID列表' })
  @IsOptional()
  @IsArray()
  visibility_account_ids?: number[]
}

export class SubmitVersionDto {
  @ApiProperty({ description: '版本号' })
  @IsNotEmpty({ message: '版本号不能为空' })
  @IsString()
  version_number: string

  @ApiProperty({ description: '更新说明' })
  @IsNotEmpty({ message: '更新说明不能为空' })
  @IsString()
  change_log: string
}

export class SkillQueryDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsInt()
  category_id?: number

  @ApiPropertyOptional({ description: '来源类型' })
  @IsOptional()
  @IsEnum(['internal', 'external'])
  source_type?: string

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string
}

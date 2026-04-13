import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'

export type VisibilityType = 'all' | 'project' | 'account'
export type SourceType = 'internal' | 'external'

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Skill名称不能为空' })
  name: string

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  description?: string | null

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsNumber()
  @IsNotEmpty({ message: '分类不能为空' })
  categoryId: number

  @IsEnum(['internal', 'external'])
  sourceType: SourceType

  @ValidateIf(o => o.sourceType === 'external')
  @IsString()
  @IsNotEmpty({ message: '外部平台来源名称不能为空' })
  sourceName?: string

  @IsEnum(['all', 'project', 'account'])
  visibilityType: VisibilityType

  @ValidateIf(o => o.visibilityType === 'project' || o.visibilityType === 'account')
  @Transform(({ value }) => {
    if (!value) return []
    if (typeof value === 'string') return value.split(',').map(Number)
    return value
  })
  @IsArray()
  @IsNumber({}, { each: true })
  visibilityTargets?: number[]
}
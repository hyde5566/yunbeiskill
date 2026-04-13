import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateSkillVersionDto {
  @IsString()
  @IsNotEmpty({ message: '版本号不能为空' })
  versionNumber: string

  @IsString()
  @IsNotEmpty({ message: 'Zip包路径不能为空' })
  zipPath: string

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 0
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsNumber()
  zipSize: number

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @IsString()
  changeLog?: string | null
}
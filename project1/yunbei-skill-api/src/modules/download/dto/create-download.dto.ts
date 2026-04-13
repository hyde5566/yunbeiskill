import { IsNumber, IsNotEmpty } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateDownloadDto {
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Skill ID不能为空' })
  skillId: number

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsNumber()
  @IsNotEmpty({ message: '版本ID不能为空' })
  versionId: number
}
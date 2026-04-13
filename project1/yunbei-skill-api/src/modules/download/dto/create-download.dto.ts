import { IsNumber, IsNotEmpty } from 'class-validator'

export class CreateDownloadDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Skill ID不能为空' })
  skillId: number

  @IsNumber()
  @IsNotEmpty({ message: '版本ID不能为空' })
  versionId: number
}
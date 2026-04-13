import { IsString, IsNotEmpty, IsOptional, IsNumber, Allow, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  username: string

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string

  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  realName: string

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsNumber()
  @IsNotEmpty({ message: '部门不能为空' })
  departmentId: number

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @Allow()
  email?: string | null

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @Allow()
  phone?: string | null
}
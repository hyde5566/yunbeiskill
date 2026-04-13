import { IsString, IsOptional, IsNumber, Allow, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  realName?: string

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    return typeof value === 'string' ? parseInt(value, 10) : value
  })
  @IsOptional()
  @IsNumber()
  departmentId?: number

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @Allow()
  email?: string | null

  @Transform(({ value }) => value === '' ? null : value)
  @IsOptional()
  @Allow()
  phone?: string | null

  @IsOptional()
  @IsNumber()
  status?: number

  @IsOptional()
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password?: string
}
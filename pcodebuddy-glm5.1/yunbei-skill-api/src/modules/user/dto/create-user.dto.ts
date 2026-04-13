import { IsNotEmpty, IsString, IsInt, IsOptional, IsEmail } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateUserDto {
  @ApiProperty({ description: '账号' })
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString()
  username: string

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string

  @ApiProperty({ description: '真实姓名' })
  @IsNotEmpty({ message: '真实姓名不能为空' })
  @IsString()
  real_name: string

  @ApiProperty({ description: '所属部门ID' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  department_id?: number

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  real_name?: string

  @ApiPropertyOptional({ description: '所属部门ID' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  department_id?: number

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '状态（1=正常，0=禁用）' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  status?: number
}

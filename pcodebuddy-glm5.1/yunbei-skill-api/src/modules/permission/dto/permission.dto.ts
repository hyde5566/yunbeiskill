import { IsNotEmpty, IsInt, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class AssignPermissionsDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @Transform(({ value }) => { if (value === null || value === undefined || value === '') return undefined; return typeof value === 'string' ? parseInt(value, 10) : value })
  @IsInt()
  user_id: number

  @ApiProperty({ description: '权限代码列表', example: ['basic', 'review'] })
  @IsNotEmpty({ message: '权限列表不能为空' })
  @IsArray()
  permission_codes: string[]
}

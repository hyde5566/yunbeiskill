import { IsNotEmpty, IsInt, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AssignPermissionsDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsInt()
  user_id: number

  @ApiProperty({ description: '权限代码列表', example: ['basic', 'review'] })
  @IsNotEmpty({ message: '权限列表不能为空' })
  @IsArray()
  permission_codes: string[]
}

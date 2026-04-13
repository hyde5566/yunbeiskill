import { IsNumber, IsArray, IsNotEmpty } from 'class-validator'

export class AssignPermissionsDto {
  @IsNumber()
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number

  @IsArray()
  @IsNotEmpty({ message: '权限不能为空' })
  permissionIds: number[]
}
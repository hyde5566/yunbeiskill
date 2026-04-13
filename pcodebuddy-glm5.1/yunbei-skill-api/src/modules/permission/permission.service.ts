import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from './entities/permission.entity'
import { UserPermission } from './entities/user-permission.entity'
import { AssignPermissionsDto } from './dto/permission.dto'

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find()
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userPermissions = await this.userPermissionRepository.find({
      where: { user_id: userId },
      relations: ['permission'],
    })
    return userPermissions.map((up) => up.permission)
  }

  async assignPermissions(assignDto: AssignPermissionsDto, assignedBy: number): Promise<void> {
    const { user_id, permission_codes } = assignDto

    // 获取所有权限
    const allPermissions = await this.permissionRepository.find()
    const permissionMap = new Map(allPermissions.map((p) => [p.code, p]))

    // 删除用户现有权限
    await this.userPermissionRepository.delete({ user_id })

    // 分配新权限
    for (const code of permission_codes) {
      const permission = permissionMap.get(code)
      if (permission) {
        const userPermission = this.userPermissionRepository.create({
          user_id,
          permission_id: permission.id,
          assigned_by: assignedBy,
        })
        await this.userPermissionRepository.save(userPermission)
      }
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from './entities/permission.entity'
import { UserPermission } from './entities/user-permission.entity'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>
  ) {}

  async getAll(): Promise<Permission[]> {
    return this.permRepo.find()
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userPerms = await this.userPermRepo.find({ where: { userId } })
    const permIds = userPerms.map(up => up.permissionId)
    if (permIds.length === 0) return []
    return this.permRepo.findByIds(permIds)
  }

  async assignToUser(dto: AssignPermissionsDto, assignedBy: number): Promise<void> {
    // 验证权限ID是否有效
    const perms = await this.permRepo.findByIds(dto.permissionIds)
    if (perms.length !== dto.permissionIds.length) {
      throw new NotFoundException('存在无效的权限ID')
    }

    // 先删除现有权限
    await this.userPermRepo.delete({ userId: dto.userId })

    // 再分配新权限
    const userPerms = dto.permissionIds.map(pid =>
      this.userPermRepo.create({
        userId: dto.userId,
        permissionId: pid,
        assignedBy
      })
    )
    await this.userPermRepo.save(userPerms)
  }
}
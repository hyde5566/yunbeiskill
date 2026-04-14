import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from '../user/entities/user.entity'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: loginDto.username } })
    if (!user) {
      throw new UnauthorizedException('账号不存在')
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误')
    }

    // 获取用户权限
    const permissions = await this.getUserPermissions(user.id)

    const payload = {
      sub: user.id,
      username: user.username,
      permissions,
      departmentId: user.departmentId
    }

    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        departmentId: user.departmentId,
        permissions
      }
    }
  }

  async getUserInfo(userId: number | string) {
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }
    const permissions = await this.getUserPermissions(id)
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      departmentId: user.departmentId,
      email: user.email,
      phone: user.phone,
      permissions
    }
  }

  async getUserPermissions(userId: number | string): Promise<string[]> {
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId
    const userPerms = await this.userPermRepo.find({ where: { userId: id } })
    const permIds = userPerms.map(up => up.permissionId)
    if (permIds.length === 0) return []
    const perms = await this.permRepo.find({ where: { id: In(permIds) } })
    return perms.map(p => p.code)
  }
}
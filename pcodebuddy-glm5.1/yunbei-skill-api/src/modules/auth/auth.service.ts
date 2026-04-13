import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from '../user/entities/user.entity'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password')
      .getOne()

    if (!user) {
      throw new UnauthorizedException('账号或密码错误')
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误')
    }

    // 获取用户权限
    const permissions = await this.getUserPermissions(user.id)

    const payload = {
      sub: user.id,
      username: user.username,
      realName: user.real_name,
      permissions,
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        department_id: user.department_id,
        permissions,
      },
    }
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userPermissions = await this.userPermissionRepository.find({
      where: { user_id: userId },
      relations: ['permission'],
    })

    return userPermissions.map((up) => up.permission.code)
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }
    const permissions = await this.getUserPermissions(userId)
    return {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      department_id: user.department_id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      permissions,
      isAdmin: permissions.includes('admin'),
    }
  }
}

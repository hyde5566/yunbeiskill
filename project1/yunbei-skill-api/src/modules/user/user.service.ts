import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } })
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    // 检查账号是否存在
    const existing = await this.findByUsername(dto.username)
    if (existing) {
      throw new NotFoundException('账号已存在')
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      realName: dto.realName,
      departmentId: dto.departmentId,
      email: dto.email ?? null,
      phone: dto.phone ?? null
    })
    return this.userRepo.save(user)
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10) as any
    }
    Object.assign(user, dto)
    return this.userRepo.save(user)
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id)
    await this.userRepo.remove(user)
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userPerms = await this.userPermRepo.find({ where: { userId } })
    const permIds = userPerms.map(up => up.permissionId)
    if (permIds.length === 0) return []
    const perms = await this.permRepo.findByIds(permIds)
    return perms.map(p => p.code)
  }

  async list(page: number, pageSize: number, filters: any) {
    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')

    if (filters.departmentId) {
      qb.where('user.departmentId = :deptId', { deptId: filters.departmentId })
    }
    if (filters.status) {
      qb.andWhere('user.status = :status', { status: filters.status })
    }
    if (filters.keyword) {
      qb.andWhere('user.realName LIKE :keyword OR user.username LIKE :keyword',
        { keyword: `%${filters.keyword}%` })
    }

    qb.skip((page - 1) * pageSize).take(pageSize)
    qb.orderBy('user.id', 'DESC')

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }
}
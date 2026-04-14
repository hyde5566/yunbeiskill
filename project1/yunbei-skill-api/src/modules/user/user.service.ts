import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'
import { Skill } from '../skill/entities/skill.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(DownloadRecord)
    private downloadRepo: Repository<DownloadRecord>
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
    // 检查是否有提交的Skill
    const submittedCount = await this.skillRepo.count({ where: { submitterId: id } })
    if (submittedCount > 0) {
      throw new BadRequestException('用户存在提交的Skill，无法删除')
    }
    // 检查是否有下载记录
    const downloadCount = await this.downloadRepo.count({ where: { userId: id } })
    if (downloadCount > 0) {
      throw new BadRequestException('用户存在下载记录，无法删除')
    }
    const user = await this.findById(id)
    await this.userRepo.remove(user)
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userPerms = await this.userPermRepo.find({ where: { userId } })
    const permIds = userPerms.map(up => up.permissionId)
    if (permIds.length === 0) return []
    const perms = await this.permRepo.find({ where: { id: In(permIds) } })
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
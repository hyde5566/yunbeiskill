import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })
    if (existing) {
      throw new BadRequestException('账号已存在')
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })
    return this.userRepository.save(user)
  }

  async findAll(pagination: PaginationDto, keyword?: string): Promise<PaginatedResult<User>> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')

    if (keyword) {
      query.where(
        '(user.username LIKE :keyword OR user.real_name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['department'],
    })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    Object.assign(user, updateUserDto)
    return this.userRepository.save(user)
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id)
    user.status = 0
    await this.userRepository.save(user)
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userPermissions = await this.userPermissionRepository.find({
      where: { user_id: userId },
      relations: ['permission'],
    })
    return userPermissions.map((up) => up.permission.code)
  }

  async getUserWithPermissions(id: number) {
    const user = await this.findOne(id)
    const permissions = await this.getUserPermissions(id)
    return { ...user, permissions }
  }
}

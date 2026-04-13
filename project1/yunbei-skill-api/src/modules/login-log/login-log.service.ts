import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoginLog } from './entities/login-log.entity'

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private logRepo: Repository<LoginLog>
  ) {}

  // 记录登录日志
  async logLogin(userId: number, username: string, ipAddress: string, device: string, success: boolean): Promise<LoginLog> {
    const log = this.logRepo.create({
      userId,
      username,
      loginType: 'login',
      ipAddress,
      device,
      status: success ? 1 : 0
    })
    return this.logRepo.save(log)
  }

  // 记录登出日志
  async logLogout(userId: number, username: string, ipAddress: string): Promise<LoginLog> {
    const log = this.logRepo.create({
      userId,
      username,
      loginType: 'logout',
      ipAddress,
      device: null,
      status: 1
    })
    return this.logRepo.save(log)
  }

  // 获取登录日志列表
  async getLogs(params: {
    userId?: number
    username?: string
    loginType?: string
    status?: number
    startDate?: Date
    endDate?: Date
    page?: number
    pageSize?: number
  }) {
    const qb = this.logRepo.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')

    if (params.userId) {
      qb.andWhere('log.userId = :userId', { userId: params.userId })
    }
    if (params.username) {
      qb.andWhere('log.username LIKE :username', { username: `%${params.username}%` })
    }
    if (params.loginType) {
      qb.andWhere('log.loginType = :loginType', { loginType: params.loginType })
    }
    if (params.status !== undefined) {
      qb.andWhere('log.status = :status', { status: params.status })
    }
    if (params.startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate: params.startDate })
    }
    if (params.endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: params.endDate })
    }

    const page = params.page || 1
    const pageSize = params.pageSize || 20
    qb.skip((page - 1) * pageSize).take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }
}
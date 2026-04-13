import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoginLog } from './entities/login-log.entity'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private loginLogRepository: Repository<LoginLog>,
  ) {}

  async create(userId: number, username: string, loginType: string, ipAddress?: string, device?: string, status: number = 1) {
    const log = this.loginLogRepository.create({
      user_id: userId,
      username,
      login_type: loginType,
      ip_address: ipAddress,
      device,
      status,
    })
    return this.loginLogRepository.save(log)
  }

  async findAll(pagination: PaginationDto, startDate?: string, endDate?: string) {
    const query = this.loginLogRepository.createQueryBuilder('log')

    if (startDate && endDate) {
      query.where('log.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('log.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }
}

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OperationLog } from './entities/operation-log.entity'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
  ) {}

  async create(userId: number, module: string, action: string, detail?: string, targetType?: string, targetId?: number, ipAddress?: string) {
    const log = this.operationLogRepository.create({
      user_id: userId,
      module,
      action,
      detail,
      target_type: targetType,
      target_id: targetId,
      ip_address: ipAddress,
    })
    return this.operationLogRepository.save(log)
  }

  async findAll(pagination: PaginationDto, module?: string, startDate?: string, endDate?: string) {
    const query = this.operationLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')

    if (module) {
      query.where('log.module = :module', { module })
    }
    if (startDate && endDate) {
      query.andWhere('log.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('log.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }
}

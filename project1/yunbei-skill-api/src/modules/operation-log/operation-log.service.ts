import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OperationLog } from './entities/operation-log.entity'

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private logRepo: Repository<OperationLog>
  ) {}

  // 记录操作日志
  async log(
    userId: number,
    module: string,
    action: string,
    targetType?: string,
    targetId?: number,
    detail?: any,
    ipAddress?: string
  ): Promise<void> {
    const log = this.logRepo.create({
      userId,
      module,
      action,
      targetType: targetType || null,
      targetId: targetId || null,
      detail: detail ? JSON.stringify(detail) : null,
      ipAddress: ipAddress || null
    })
    await this.logRepo.save(log)
  }

  // 获取操作日志列表（管理员）
  async getLogs(params: {
    userId?: number
    module?: string
    action?: string
    targetType?: string
    startDate?: Date
    endDate?: Date
    page?: number
    pageSize?: number
  }) {
    const qb = this.logRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')

    if (params.userId) {
      qb.andWhere('log.userId = :userId', { userId: params.userId })
    }
    if (params.module) {
      qb.andWhere('log.module = :module', { module: params.module })
    }
    if (params.action) {
      qb.andWhere('log.action = :action', { action: params.action })
    }
    if (params.targetType) {
      qb.andWhere('log.targetType = :targetType', { targetType: params.targetType })
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
    qb.orderBy('log.createdAt', 'DESC')

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }
}
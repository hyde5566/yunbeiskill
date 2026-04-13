import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { OperationLogService } from './operation-log.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('operation-logs')
@UseGuards(JwtAuthGuard)
export class OperationLogController {
  constructor(private logService: OperationLogService) {}

  @Get()
  @RequirePermission('admin')
  async getLogs(
    @Query('userId') userId?: number,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.logService.getLogs({
      userId: userId ? Number(userId) : undefined,
      module,
      action,
      targetType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20
    })
  }
}
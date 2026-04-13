import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { OperationLogService } from './operation-log.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('操作日志')
@Controller('operation-logs')
@RequirePermission('admin')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @ApiOperation({ summary: '获取操作日志列表' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('module') module?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.operationLogService.findAll(pagination, module, startDate, endDate)
  }
}

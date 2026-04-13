import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LoginLogService } from './login-log.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('登录日志')
@Controller('login-logs')
@RequirePermission('admin')
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get()
  @ApiOperation({ summary: '获取登录日志列表' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.loginLogService.findAll(pagination, startDate, endDate)
  }
}

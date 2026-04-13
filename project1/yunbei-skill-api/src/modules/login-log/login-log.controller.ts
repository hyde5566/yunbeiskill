import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { LoginLogService } from './login-log.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('login-logs')
@UseGuards(JwtAuthGuard)
export class LoginLogController {
  constructor(private logService: LoginLogService) {}

  @Get()
  @RequirePermission('admin')
  async getLogs(
    @Query('userId') userId?: number,
    @Query('username') username?: string,
    @Query('loginType') loginType?: string,
    @Query('status') status?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.logService.getLogs({
      userId: userId ? Number(userId) : undefined,
      username,
      loginType,
      status: status !== undefined ? Number(status) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20
    })
  }
}
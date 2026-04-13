import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @RequirePermission('basic')
  async getList(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.notificationService.getUserNotifications(
      req.user.userId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    )
  }

  @Get('unread-count')
  @RequirePermission('basic')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.userId)
    return { count }
  }

  @Post(':id/read')
  @RequirePermission('basic')
  async markAsRead(@Param('id') id: number, @Request() req: any) {
    await this.notificationService.markAsRead(req.user.userId, Number(id))
    return { success: true }
  }

  @Post('read-all')
  @RequirePermission('basic')
  async markAllAsRead(@Request() req: any) {
    await this.notificationService.markAllAsRead(req.user.userId)
    return { success: true }
  }
}
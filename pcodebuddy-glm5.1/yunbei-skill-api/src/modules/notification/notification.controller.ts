import { Controller, Get, Post, Put, Delete, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { NotificationService } from './notification.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('站内通知')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  getMyNotifications(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.getMyNotifications(user.userId, pagination)
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationService.getUnreadCount(user.userId)
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记通知已读' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.notificationService.markAsRead(id, user.userId)
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.userId)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.notificationService.remove(id, user.userId)
  }
}

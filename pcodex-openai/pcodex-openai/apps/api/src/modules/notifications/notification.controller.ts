import { Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import { NotificationService } from "./notification.service";

interface CurrentUserPayload {
  sub: string;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: QueryNotificationsDto,
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.notificationService.findAll(currentUser, query),
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.notificationService.findOne(id, currentUser),
    };
  }

  @Patch(":id/read")
  async markAsRead(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "标记成功",
      data: await this.notificationService.markAsRead(id, currentUser),
    };
  }
}

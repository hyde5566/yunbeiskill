import { Controller, Get, UseGuards } from "@nestjs/common";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { LoginLogService } from "./login-log.service";

@Controller("login-logs")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get()
  @Permissions("login-log.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.loginLogService.findAll(),
    };
  }
}

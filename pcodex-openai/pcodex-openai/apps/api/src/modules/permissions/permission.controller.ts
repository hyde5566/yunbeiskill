import { Controller, Get, UseGuards } from "@nestjs/common";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { PermissionService } from "./permission.service";

@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Permissions("role.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.permissionService.findAll(),
    };
  }
}

import { Controller, Get, UseGuards } from "@nestjs/common";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { OperationLogService } from "./operation-log.service";

@Controller("operation-logs")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @Permissions("operation-log.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.operationLogService.findAll(),
    };
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { AssignUserRolesDto } from "./dto/assign-user-roles.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions("user.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.userService.findAll(),
    };
  }

  @Post()
  @Permissions("user.create")
  @AuditLog({ module: "users", operationType: "create", targetType: "user" })
  async create(@Body() dto: CreateUserDto) {
    return {
      success: true,
      message: "创建成功",
      data: await this.userService.create(dto),
    };
  }

  @Patch(":id")
  @Permissions("user.edit")
  @AuditLog({ module: "users", operationType: "update", targetType: "user" })
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return {
      success: true,
      message: "更新成功",
      data: await this.userService.update(id, dto),
    };
  }

  @Patch(":id/roles")
  @Permissions("user.assign-role")
  @AuditLog({ module: "users", operationType: "assign-role", targetType: "user" })
  async assignRoles(@Param("id") id: string, @Body() dto: AssignUserRolesDto) {
    return {
      success: true,
      message: "角色分配成功",
      data: await this.userService.assignRoles(id, dto.roleIds),
    };
  }

  @Patch(":id/status")
  @Permissions("user.enable-disable")
  @AuditLog({ module: "users", operationType: "update-status", targetType: "user" })
  async updateStatus(@Param("id") id: string, @Body() dto: UpdateUserStatusDto) {
    return {
      success: true,
      message: "状态更新成功",
      data: await this.userService.updateStatus(id, dto.status),
    };
  }

  @Delete(":id")
  @Permissions("user.delete")
  @AuditLog({ module: "users", operationType: "delete", targetType: "user" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() currentUser: { sub: string },
  ) {
    return {
      success: true,
      message: "删除成功",
      data: await this.userService.remove(id, currentUser.sub),
    };
  }
}

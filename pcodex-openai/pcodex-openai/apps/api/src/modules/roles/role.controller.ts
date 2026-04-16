import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./role.service";

@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Permissions("role.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.roleService.findAll(),
    };
  }

  @Post()
  @Permissions("role.create")
  @AuditLog({ module: "roles", operationType: "create", targetType: "role" })
  async create(@Body() dto: CreateRoleDto) {
    return {
      success: true,
      message: "创建成功",
      data: await this.roleService.create(dto),
    };
  }

  @Patch(":id")
  @Permissions("role.edit")
  @AuditLog({ module: "roles", operationType: "update", targetType: "role" })
  async update(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return {
      success: true,
      message: "更新成功",
      data: await this.roleService.update(id, dto),
    };
  }

  @Delete(":id")
  @Permissions("role.delete")
  @AuditLog({ module: "roles", operationType: "delete", targetType: "role" })
  async remove(@Param("id") id: string) {
    return {
      success: true,
      message: "删除成功",
      data: await this.roleService.remove(id),
    };
  }
}

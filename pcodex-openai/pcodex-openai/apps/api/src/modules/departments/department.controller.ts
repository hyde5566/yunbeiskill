import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { DepartmentService } from "./department.service";

@Controller("departments")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Permissions("department.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.departmentService.findAll(),
    };
  }

  @Post()
  @Permissions("department.create")
  @AuditLog({ module: "departments", operationType: "create", targetType: "department" })
  async create(@Body() dto: CreateDepartmentDto) {
    return {
      success: true,
      message: "创建成功",
      data: await this.departmentService.create(dto),
    };
  }

  @Patch(":id")
  @Permissions("department.edit")
  @AuditLog({ module: "departments", operationType: "update", targetType: "department" })
  async update(@Param("id") id: string, @Body() dto: UpdateDepartmentDto) {
    return {
      success: true,
      message: "更新成功",
      data: await this.departmentService.update(id, dto),
    };
  }

  @Delete(":id")
  @Permissions("department.delete")
  @AuditLog({ module: "departments", operationType: "delete", targetType: "department" })
  async remove(@Param("id") id: string) {
    return {
      success: true,
      message: "删除成功",
      data: await this.departmentService.remove(id),
    };
  }
}

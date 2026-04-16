import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ManageProjectMembersDto } from "./dto/manage-project-members.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectService } from "./project.service";

@Controller("projects")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Permissions("project.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.projectService.findAll(),
    };
  }

  @Post()
  @Permissions("project.create")
  @AuditLog({ module: "projects", operationType: "create", targetType: "project" })
  async create(@Body() dto: CreateProjectDto) {
    return {
      success: true,
      message: "创建成功",
      data: await this.projectService.create(dto),
    };
  }

  @Patch(":id")
  @Permissions("project.edit")
  @AuditLog({ module: "projects", operationType: "update", targetType: "project" })
  async update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return {
      success: true,
      message: "更新成功",
      data: await this.projectService.update(id, dto),
    };
  }

  @Delete(":id")
  @Permissions("project.delete")
  @AuditLog({ module: "projects", operationType: "delete", targetType: "project" })
  async remove(@Param("id") id: string) {
    return {
      success: true,
      message: "删除成功",
      data: await this.projectService.remove(id),
    };
  }

  @Post(":id/members")
  @Permissions("project.member.add")
  @AuditLog({ module: "projects", operationType: "add-member", targetType: "project" })
  async addMembers(@Param("id") id: string, @Body() dto: ManageProjectMembersDto) {
    return {
      success: true,
      message: "添加成功",
      data: await this.projectService.addMembers(id, dto.userIds),
    };
  }

  @Delete(":id/members/:userId")
  @Permissions("project.member.remove")
  @AuditLog({ module: "projects", operationType: "remove-member", targetType: "project" })
  async removeMember(@Param("id") id: string, @Param("userId") userId: string) {
    return {
      success: true,
      message: "移除成功",
      data: await this.projectService.removeMember(id, userId),
    };
  }
}

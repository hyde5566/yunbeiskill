import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { UpdateSkillCategoryDto } from "./dto/update-skill-category.dto";
import { SkillCategoryService } from "./skill-category.service";

@Controller("skill-categories")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SkillCategoryController {
  constructor(private readonly skillCategoryService: SkillCategoryService) {}

  @Get()
  @Permissions("skill-category.view")
  async findAll() {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillCategoryService.findAll(),
    };
  }

  @Patch(":id")
  @Permissions("skill-category.edit")
  @AuditLog({ module: "skill-categories", operationType: "update", targetType: "skill-category" })
  async update(@Param("id") id: string, @Body() dto: UpdateSkillCategoryDto) {
    return {
      success: true,
      message: "更新成功",
      data: await this.skillCategoryService.update(id, dto),
    };
  }
}

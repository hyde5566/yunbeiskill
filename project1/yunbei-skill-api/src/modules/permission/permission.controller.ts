import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PermissionService } from './permission.service'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private permService: PermissionService) {}

  @Get()
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取所有权限列表' })
  async getAll() {
    return this.permService.getAll()
  }

  @Get('user/:userId')
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取用户权限' })
  async getUserPermissions(@Param('userId') userId: number) {
    return this.permService.getUserPermissions(userId)
  }

  @Post('assign')
  @RequirePermission('admin')
  @ApiOperation({ summary: '分配权限给用户' })
  async assignToUser(@Body() dto: AssignPermissionsDto, @Request() req) {
    await this.permService.assignToUser(dto, req.user.userId)
    return { message: '权限分配成功' }
  }
}
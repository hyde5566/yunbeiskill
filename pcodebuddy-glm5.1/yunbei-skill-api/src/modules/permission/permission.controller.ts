import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PermissionService } from './permission.service'
import { AssignPermissionsDto } from './dto/permission.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('权限管理')
@Controller('permissions')
@RequirePermission('admin')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: '获取所有权限列表' })
  findAll() {
    return this.permissionService.findAll()
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户权限' })
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionService.getUserPermissions(userId)
  }

  @Post('assign')
  @ApiOperation({ summary: '分配用户权限' })
  assignPermissions(
    @Body() assignDto: AssignPermissionsDto,
    @CurrentUser() user: any,
  ) {
    return this.permissionService.assignPermissions(assignDto, user.userId)
  }
}

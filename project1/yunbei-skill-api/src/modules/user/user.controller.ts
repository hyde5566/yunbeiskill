import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取用户列表' })
  async list(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('departmentId') departmentId?: number,
    @Query('status') status?: number,
    @Query('keyword') keyword?: string
  ) {
    return this.userService.list(page, pageSize, { departmentId, status, keyword })
  }

  @Get(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取用户详情' })
  async get(@Param('id') id: number) {
    const user = await this.userService.findById(id)
    const permissions = await this.userService.getUserPermissions(id)
    return { ...user, permissions }
  }

  @Post()
  @RequirePermission('admin')
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新用户' })
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除用户' })
  async remove(@Param('id') id: number) {
    await this.userService.remove(id)
    return { message: '删除成功' }
  }
}
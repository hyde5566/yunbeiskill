import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { DepartmentService } from './department.service'
import { CreateDeptDto } from './dto/create-dept.dto'
import { UpdateDeptDto } from './dto/update-dept.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('部门管理')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private deptService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: '获取部门列表' })
  async list() {
    return this.deptService.list()
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树形结构' })
  async getTree() {
    return this.deptService.getTree()
  }

  @Post()
  @RequirePermission('admin')
  @ApiOperation({ summary: '创建部门' })
  async create(@Body() dto: CreateDeptDto) {
    return this.deptService.create(dto)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新部门' })
  async update(@Param('id') id: number, @Body() dto: UpdateDeptDto) {
    return this.deptService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除部门' })
  async remove(@Param('id') id: number) {
    await this.deptService.remove(id)
    return { message: '删除成功' }
  }
}
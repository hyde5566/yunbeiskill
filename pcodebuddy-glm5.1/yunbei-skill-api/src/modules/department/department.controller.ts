import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { DepartmentService } from './department.service'
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('部门管理')
@Controller('departments')
@RequirePermission('admin')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: '获取部门列表' })
  findAll() {
    return this.departmentService.findAll()
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树形结构' })
  getTree() {
    return this.departmentService.getTree()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id)
  }

  @Get(':id/members')
  @ApiOperation({ summary: '获取部门成员' })
  getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getMembers(id)
  }

  @Post()
  @ApiOperation({ summary: '创建部门' })
  create(@Body() createDto: CreateDepartmentDto) {
    return this.departmentService.create(createDto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id)
  }
}

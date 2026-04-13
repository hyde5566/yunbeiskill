import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SkillCategoryService } from './skill-category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('Skill分类管理')
@ApiBearerAuth()
@Controller('skill-categories')
export class SkillCategoryController {
  constructor(private categoryService: SkillCategoryService) {}

  @Get()
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取分类列表' })
  list() {
    return this.categoryService.list()
  }

  @Get(':id')
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取分类详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findById(id)
  }

  @Post()
  @RequirePermission('admin')
  @ApiOperation({ summary: '创建分类' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新分类' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除分类' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id)
  }
}
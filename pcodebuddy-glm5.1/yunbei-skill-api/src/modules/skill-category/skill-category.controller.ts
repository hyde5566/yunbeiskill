import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SkillCategoryService } from './skill-category.service'
import { CreateSkillCategoryDto, UpdateSkillCategoryDto } from './dto/skill-category.dto'
import { Public } from '../../common/decorators/public.decorator'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('Skill分类')
@Controller('skill-categories')
export class SkillCategoryController {
  constructor(private readonly categoryService: SkillCategoryService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取分类列表' })
  findAll() {
    return this.categoryService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id)
  }

  @Post()
  @RequirePermission('admin')
  @ApiOperation({ summary: '创建分类' })
  create(@Body() createDto: CreateSkillCategoryDto) {
    return this.categoryService.create(createDto)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新分类' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSkillCategoryDto,
  ) {
    return this.categoryService.update(id, updateDto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除分类' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id)
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ProjectService } from './project.service'
import { CreateProjectDto, UpdateProjectDto, AddProjectMembersDto, AddProjectSkillDto } from './dto/project.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission, Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('项目管理')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: '获取项目列表' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('keyword') keyword?: string,
  ) {
    return this.projectService.findAll(pagination, keyword)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id)
  }

  @Get(':id/members')
  @ApiOperation({ summary: '获取项目成员' })
  getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.getMembers(id)
  }

  @Post()
  @RequirePermission('admin')
  @ApiOperation({ summary: '创建项目' })
  create(@Body() createDto: CreateProjectDto) {
    return this.projectService.create(createDto)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新项目' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, updateDto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除项目' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id)
  }

  @Post(':id/members')
  @RequirePermission('admin')
  @ApiOperation({ summary: '添加项目成员' })
  addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProjectMembersDto,
  ) {
    return this.projectService.addMembers(id, dto)
  }

  @Delete(':id/members/:userId')
  @RequirePermission('admin')
  @ApiOperation({ summary: '移除项目成员' })
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectService.removeMember(id, userId)
  }

  @Post(':id/skills')
  @RequirePermission('admin')
  @ApiOperation({ summary: '关联Skill' })
  addSkills(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddProjectSkillDto,
  ) {
    return this.projectService.addSkills(id, dto)
  }

  @Delete(':id/skills/:skillId')
  @RequirePermission('admin')
  @ApiOperation({ summary: '取消关联Skill' })
  removeSkill(
    @Param('id', ParseIntPipe) id: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.projectService.removeSkill(id, skillId)
  }
}

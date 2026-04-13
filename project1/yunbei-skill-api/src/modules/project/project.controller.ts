import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ProjectService } from './project.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  @RequirePermission('basic')
  list() {
    return this.projectService.list()
  }

  @Get(':id')
  @RequirePermission('basic')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findById(id)
  }

  @Post()
  @RequirePermission('admin')
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto)
  }

  @Put(':id')
  @RequirePermission('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id)
  }

  @Get(':id/members')
  @RequirePermission('admin')
  getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.getMembers(id)
  }

  @Post(':id/members')
  @RequirePermission('admin')
  addMembers(@Param('id', ParseIntPipe) id: number, @Body('userIds') userIds: number[]) {
    return this.projectService.addMembers(id, userIds)
  }

  @Delete(':id/members/:userId')
  @RequirePermission('admin')
  removeMember(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) userId: number) {
    return this.projectService.removeMember(id, userId)
  }
}
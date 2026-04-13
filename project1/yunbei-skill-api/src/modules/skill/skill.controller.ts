import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SkillService } from './skill.service'
import { CreateSkillDto } from './dto/create-skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'
import { CreateSkillVersionDto } from './dto/create-skill-version.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('Skill管理')
@ApiBearerAuth()
@Controller('skills')
export class SkillController {
  constructor(private skillService: SkillService) {}

  // ========== 静态路由（必须放在动态路由 :id 之前） ==========

  @Get()
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取Skill列表' })
  list(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('keyword') keyword?: string,
    @Query('categoryId') categoryId?: number,
    @Query('sourceType') sourceType?: string,
    @Query('status') status?: string
  ) {
    return this.skillService.list({ page, pageSize, keyword, categoryId, sourceType, status })
  }

  @Get('my')
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取我提交的Skill' })
  mySkills(@Request() req: any) {
    return this.skillService.list({ userId: req.user.id })
  }

  @Get('pending-review')
  @RequirePermission('review')
  @ApiOperation({ summary: '获取待审核Skill列表' })
  pendingReview(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20
  ) {
    return this.skillService.list({ page, pageSize, isReview: true, status: 'pending_review' })
  }

  @Get('pending-version-review')
  @RequirePermission('review')
  @ApiOperation({ summary: '获取待审核版本列表' })
  pendingVersionReview(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.skillService.listPendingVersions({
      page: parseInt(page || '1'),
      pageSize: parseInt(pageSize || '20')
    })
  }

  @Post()
  @RequirePermission('basic')
  @ApiOperation({ summary: '创建Skill' })
  create(@Body() dto: CreateSkillDto, @Request() req: any) {
    return this.skillService.create(dto, req.user.id)
  }

  // ========== 动态路由 :id ==========

  @Get(':id')
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取Skill详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.findById(id)
  }

  @Put(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '更新Skill（管理员）' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSkillDto) {
    return this.skillService.update(id, dto)
  }

  @Put(':id/resubmit')
  @RequirePermission('basic')
  @ApiOperation({ summary: '修改并重新提交（用户）' })
  resubmit(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSkillDto, @Request() req: any) {
    return this.skillService.resubmit(id, dto, req.user.id)
  }

  @Delete(':id')
  @RequirePermission('admin')
  @ApiOperation({ summary: '删除Skill' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.remove(id)
  }

  @Get(':id/versions')
  @RequirePermission('basic')
  @ApiOperation({ summary: '获取版本列表' })
  getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.getVersions(id)
  }

  @Post(':id/versions')
  @RequirePermission('basic')
  @ApiOperation({ summary: '添加新版本' })
  addVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSkillVersionDto,
    @Request() req: any
  ) {
    return this.skillService.addVersion(id, dto, req.user.id)
  }

  @Post(':id/versions/:versionId/approve')
  @RequirePermission('review')
  @ApiOperation({ summary: '审核通过版本' })
  approveVersion(@Param('id', ParseIntPipe) id: number, @Param('versionId', ParseIntPipe) versionId: number) {
    return this.skillService.approveVersion(id, versionId)
  }

  @Post(':id/versions/:versionId/reject')
  @RequirePermission('review')
  @ApiOperation({ summary: '审核驳回版本' })
  rejectVersion(@Param('id', ParseIntPipe) id: number, @Param('versionId', ParseIntPipe) versionId: number, @Body('reason') reason: string) {
    return this.skillService.rejectVersion(id, versionId, reason)
  }

  @Post(':id/approve')
  @RequirePermission('review')
  @ApiOperation({ summary: '审核通过' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.approve(id)
  }

  @Post(':id/reject')
  @RequirePermission('review')
  @ApiOperation({ summary: '审核驳回' })
  reject(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string) {
    return this.skillService.reject(id, reason)
  }

  @Post(':id/publish')
  @RequirePermission('admin')
  @ApiOperation({ summary: '发布Skill' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.publish(id)
  }

  @Post(':id/unpublish')
  @RequirePermission('admin')
  @ApiOperation({ summary: '下架Skill' })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.unpublish(id)
  }
}
import { Controller, Get, UseGuards, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { StatsService } from './stats.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('overview')
  @RequirePermission('admin')
  async getOverview() {
    return this.statsService.getOverview()
  }

  @Get('skills')
  @RequirePermission('admin')
  async getSkillStats() {
    return this.statsService.getSkillStats()
  }

  @Get('downloads')
  @RequirePermission('admin')
  async getDownloadStats() {
    return this.statsService.getDownloadStats()
  }

  @Get('categories')
  @RequirePermission('admin')
  async getCategoryStats() {
    return this.statsService.getCategoryStats()
  }

  @Get('projects')
  @RequirePermission('admin')
  async getProjectStats() {
    return this.statsService.getProjectStats()
  }

  @Get('users')
  @RequirePermission('admin')
  async getUserStats(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20
  ) {
    return this.statsService.getUserStats({ page, pageSize })
  }

  // 导出功能
  @Get('export/skills')
  @RequirePermission('admin')
  async exportSkills(@Res() res: Response) {
    const csv = await this.statsService.exportSkillsCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=skills_stats.csv')
    res.send(csv)
  }

  @Get('export/downloads')
  @RequirePermission('admin')
  async exportDownloads(@Res() res: Response) {
    const csv = await this.statsService.exportDownloadsCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=downloads_stats.csv')
    res.send(csv)
  }

  @Get('export/users')
  @RequirePermission('admin')
  async exportUsers(@Res() res: Response) {
    const csv = await this.statsService.exportUsersCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=users_stats.csv')
    res.send(csv)
  }

  @Get('export/categories')
  @RequirePermission('admin')
  async exportCategories(@Res() res: Response) {
    const csv = await this.statsService.exportCategoriesCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=categories_stats.csv')
    res.send(csv)
  }
}
import { Controller, Get, Query, Res, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import type { Response } from 'express'
import { StatisticsService } from './statistics.service'
import { RequirePermission } from '../../common/decorators/public.decorator'

@ApiTags('统计管理')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '全局统计概览' })
  getOverview() {
    return this.statisticsService.getOverview()
  }

  @Get('dashboard')
  @ApiOperation({ summary: '仪表盘数据' })
  getDashboard() {
    return this.statisticsService.getDashboard()
  }

  @Get('by-category')
  @ApiOperation({ summary: '分类统计' })
  getByCategory() {
    return this.statisticsService.getByCategory()
  }

  @Get('top-downloads')
  @ApiOperation({ summary: '下载Top统计' })
  getTopDownloads(@Query('limit') limit?: string) {
    return this.statisticsService.getTopDownloads(limit ? parseInt(limit, 10) : 10)
  }

  @Get('rating-distribution')
  @ApiOperation({ summary: '评分分布' })
  getRatingDistribution() {
    return this.statisticsService.getRatingDistribution()
  }

  @Get('download-trend')
  @ApiOperation({ summary: '下载趋势' })
  getDownloadTrend(@Query('months') months?: string) {
    return this.statisticsService.getDownloadTrend(months ? parseInt(months, 10) : 6)
  }

  @Get('by-rating')
  @ApiOperation({ summary: '评分统计' })
  getByRating() {
    return this.statisticsService.getByRating()
  }

  @Get('by-download')
  @ApiOperation({ summary: '下载统计' })
  getByDownload() {
    return this.statisticsService.getByDownload()
  }

  @Get('by-project')
  @ApiOperation({ summary: '项目统计' })
  getByProject() {
    return this.statisticsService.getByProject()
  }

  @Get('by-user')
  @ApiOperation({ summary: '用户统计' })
  getByUser() {
    return this.statisticsService.getByUser()
  }

  @Get('timeline')
  @ApiOperation({ summary: '时间维度统计' })
  getTimeline(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statisticsService.getTimeline(startDate, endDate)
  }

  @Get('export/:type')
  @ApiOperation({ summary: '导出统计' })
  async exportStats(
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.statisticsService.exportStats(type)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}

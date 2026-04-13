import { Controller, Get, Post, Query, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { DownloadService } from './download.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('下载记录')
@Controller('downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('my/skills')
  @ApiOperation({ summary: '我下载过的Skill列表' })
  getMyDownloadedSkills(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.downloadService.getMyDownloadedSkills(user.userId, pagination)
  }

  @Get('my/records')
  @ApiOperation({ summary: '我的下载记录详情' })
  getMyDownloadRecords(
    @Query() pagination: PaginationDto,
    @Query('skillName') skillName?: string,
    @CurrentUser() user?: any,
  ) {
    return this.downloadService.getMyDownloadRecords(user.userId, pagination, skillName)
  }

  @Get('stats')
  @RequirePermission('admin')
  @ApiOperation({ summary: '全局下载统计' })
  getGlobalStats() {
    return this.downloadService.getGlobalStats()
  }
}

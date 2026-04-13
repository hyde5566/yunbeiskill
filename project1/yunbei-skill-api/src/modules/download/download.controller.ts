import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { DownloadService } from './download.service'
import { CreateDownloadDto } from './dto/create-download.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('downloads')
@UseGuards(JwtAuthGuard)
export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  @Post()
  @RequirePermission('basic')
  async download(@Body() dto: CreateDownloadDto, @Request() req: any) {
    const userId = req.user.userId
    const departmentId = req.user.departmentId
    return this.downloadService.recordDownload(dto, userId, departmentId)
  }

  @Get('my')
  @RequirePermission('basic')
  async getMyDownloads(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.downloadService.getUserDownloads(
      req.user.userId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    )
  }

  @Get('stats/:skillId')
  @RequirePermission('basic')
  async getStats(@Param('skillId') skillId: number) {
    return this.downloadService.getSkillDownloadStats(Number(skillId))
  }
}
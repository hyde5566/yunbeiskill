import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto, MarkInvalidDto } from './dto/feedback.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('反馈')
@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: '提交反馈' })
  create(@Body() createDto: CreateFeedbackDto, @CurrentUser() user: any) {
    return this.feedbackService.create(createDto, user.id)
  }

  @Get('skill/:skillId')
  @ApiOperation({ summary: '获取Skill反馈列表' })
  getSkillFeedbacks(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.feedbackService.getSkillFeedbacks(skillId, pagination)
  }

  @Get('my')
  @ApiOperation({ summary: '我的反馈记录' })
  getMyFeedbacks(@CurrentUser() user: any) {
    return this.feedbackService.getMyFeedbacks(user.id)
  }

  @Get('all')
  @RequirePermission('admin')
  @ApiOperation({ summary: '所有反馈（管理员）' })
  findAll(@Query() pagination: PaginationDto) {
    return this.feedbackService.findAll(pagination)
  }

  @Put(':id/invalid')
  @RequirePermission('admin')
  @ApiOperation({ summary: '标记无效反馈' })
  markInvalid(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkInvalidDto,
  ) {
    return this.feedbackService.markInvalid(id, dto)
  }
}

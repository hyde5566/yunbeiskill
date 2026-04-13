import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('feedbacks')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @RequirePermission('basic')
  async create(@Body() dto: CreateFeedbackDto, @Request() req: any) {
    return this.feedbackService.create(dto, req.user.userId)
  }

  @Get('skill/:skillId')
  @RequirePermission('basic')
  async getSkillFeedbacks(
    @Param('skillId') skillId: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.feedbackService.getSkillFeedbacks(
      Number(skillId),
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    )
  }

  @Get('my')
  @RequirePermission('basic')
  async getMyFeedbacks(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.feedbackService.getUserFeedbacks(
      req.user.userId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    )
  }
}
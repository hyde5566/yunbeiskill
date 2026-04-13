import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ReviewService } from './review.service'
import { AssignReviewerDto, ReviewActionDto } from './dto/review.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { RequirePermission } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('审核管理')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('pending')
  @RequirePermission('review')
  @ApiOperation({ summary: '获取待审核列表' })
  getPendingReviews(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.getPendingReviews(pagination, user.userId)
  }

  @Get('all')
  @RequirePermission('admin')
  @ApiOperation({ summary: '获取所有审核记录' })
  getAllReviews(
    @Query() pagination: PaginationDto,
    @Query('skillId') skillId?: number,
  ) {
    return this.reviewService.getReviewHistory(pagination, skillId)
  }

  @Post('assign')
  @RequirePermission('admin')
  @ApiOperation({ summary: '分配审核员' })
  assignReviewer(
    @Body() assignDto: AssignReviewerDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.assignReviewer(assignDto, user.userId)
  }

  @Post(':id/action')
  @RequirePermission('review')
  @ApiOperation({ summary: '执行审核（通过/驳回）' })
  reviewAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: ReviewActionDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.reviewAction(id, actionDto, user.userId)
  }
}

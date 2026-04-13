import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { RatingService } from './rating.service'
import { CreateRatingDto } from './dto/rating.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('评分')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: '提交评分' })
  create(@Body() createDto: CreateRatingDto, @CurrentUser() user: any) {
    return this.ratingService.create(createDto, user.userId)
  }

  @Get('skill/:skillId')
  @ApiOperation({ summary: '获取Skill评分统计' })
  getSkillRatings(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.ratingService.getSkillRatings(skillId)
  }

  @Get('my')
  @ApiOperation({ summary: '我的评分记录' })
  getMyRatings(@CurrentUser() user: any) {
    return this.ratingService.getMyRatings(user.userId)
  }
}

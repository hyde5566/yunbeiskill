import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common'
import { RatingService } from './rating.service'
import { CreateRatingDto } from './dto/create-rating.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RequirePermission } from '../../common/decorators/public.decorator'

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private ratingService: RatingService) {}

  @Post()
  @RequirePermission('basic')
  async rate(@Body() dto: CreateRatingDto, @Request() req: any) {
    return this.ratingService.rate(dto, req.user.userId)
  }

  @Get('my/:skillId')
  @RequirePermission('basic')
  async getMyRating(@Param('skillId') skillId: number, @Request() req: any) {
    return this.ratingService.getUserRating(Number(skillId), req.user.userId)
  }

  @Get('stats/:skillId')
  @RequirePermission('basic')
  async getStats(@Param('skillId') skillId: number) {
    return this.ratingService.getSkillRatingStats(Number(skillId))
  }
}
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewController } from './review.controller'
import { ReviewService } from './review.service'
import { Review } from './entities/review.entity'
import { Skill } from '../skill/entities/skill.entity'
import { SkillVersion } from '../skill/entities/skill-version.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Review, Skill, SkillVersion])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}

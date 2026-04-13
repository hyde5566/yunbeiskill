import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'
import { Skill } from '../skill/entities/skill.entity'
import { User } from '../user/entities/user.entity'
import { Rating } from '../rating/entities/rating.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'
import { Review } from '../review/entities/review.entity'
import { Feedback } from '../feedback/entities/feedback.entity'
import { Project } from '../project/entities/project.entity'
import { SkillCategory } from '../skill-category/entities/skill-category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, User, Rating, DownloadRecord, Review, Feedback, Project, SkillCategory])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatsService } from './stats.service'
import { StatsController } from './stats.controller'
import { Skill } from '../skill/entities/skill.entity'
import { SkillVersion } from '../skill/entities/skill-version.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'
import { Rating } from '../rating/entities/rating.entity'
import { Feedback } from '../feedback/entities/feedback.entity'
import { SkillCategory } from '../skill-category/entities/skill-category.entity'
import { User } from '../user/entities/user.entity'
import { Project } from '../project/entities/project.entity'
import { SkillVisibility } from '../skill/entities/skill-visibility.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, SkillVersion, DownloadRecord, Rating, Feedback, SkillCategory, User, Project, SkillVisibility])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}
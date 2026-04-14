import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SkillController } from './skill.controller'
import { SkillService } from './skill.service'
import { Skill } from './entities/skill.entity'
import { SkillVersion } from './entities/skill-version.entity'
import { SkillVisibility } from './entities/skill-visibility.entity'
import { ProjectSkill } from '../project/entities/project-skill.entity'
import { ProjectModule } from '../project/project.module'
import { DownloadModule } from '../download/download.module'
import { User } from '../user/entities/user.entity'
import { Review } from '../review/entities/review.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, SkillVersion, SkillVisibility, ProjectSkill, User, Review]),
    ProjectModule,
    DownloadModule,
  ],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}

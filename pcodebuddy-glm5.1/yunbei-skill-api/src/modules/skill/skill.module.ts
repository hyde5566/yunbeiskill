import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SkillController } from './skill.controller'
import { SkillService } from './skill.service'
import { Skill } from './entities/skill.entity'
import { SkillVersion } from './entities/skill-version.entity'
import { SkillVisibility } from './entities/skill-visibility.entity'
import { ProjectSkill } from '../project/entities/project-skill.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, SkillVersion, SkillVisibility, ProjectSkill])],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}

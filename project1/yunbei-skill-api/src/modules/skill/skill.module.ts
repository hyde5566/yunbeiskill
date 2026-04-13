import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SkillController } from './skill.controller'
import { SkillService } from './skill.service'
import { Skill } from './entities/skill.entity'
import { SkillVersion } from './entities/skill-version.entity'
import { SkillVisibility } from './entities/skill-visibility.entity'
import { SkillCategory } from '../skill-category/entities/skill-category.entity'
import { User } from '../user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, SkillVersion, SkillVisibility, SkillCategory, User])],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService]
})
export class SkillModule {}
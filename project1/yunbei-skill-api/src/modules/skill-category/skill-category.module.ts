import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SkillCategoryController } from './skill-category.controller'
import { SkillCategoryService } from './skill-category.service'
import { SkillCategory } from './entities/skill-category.entity'
import { Skill } from '../skill/entities/skill.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory, Skill])],
  controllers: [SkillCategoryController],
  providers: [SkillCategoryService],
  exports: [SkillCategoryService]
})
export class SkillCategoryModule {}
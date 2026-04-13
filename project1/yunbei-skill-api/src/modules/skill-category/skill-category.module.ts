import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SkillCategoryController } from './skill-category.controller'
import { SkillCategoryService } from './skill-category.service'
import { SkillCategory } from './entities/skill-category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory])],
  controllers: [SkillCategoryController],
  providers: [SkillCategoryService],
  exports: [SkillCategoryService]
})
export class SkillCategoryModule {}
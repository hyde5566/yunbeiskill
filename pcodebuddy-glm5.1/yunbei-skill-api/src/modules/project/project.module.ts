import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project-member.entity'
import { ProjectSkill } from './entities/project-skill.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, ProjectSkill])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}

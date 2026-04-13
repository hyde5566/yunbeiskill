import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Project } from './project.entity'
import { Skill } from '../../skill/entities/skill.entity'

@Entity('project_skills')
export class ProjectSkill {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '项目ID' })
  @Column({ type: 'bigint' })
  project_id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => Project, (p) => p.projectSkills)
  @JoinColumn({ name: 'project_id' })
  project: Project

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill
}

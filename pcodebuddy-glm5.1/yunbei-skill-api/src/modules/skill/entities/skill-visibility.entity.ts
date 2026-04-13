import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Skill } from './skill.entity'

@Entity('skill_visibility')
export class SkillVisibility {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '目标类型（project/account）' })
  @Column({ length: 50 })
  target_type: string

  @ApiProperty({ description: '目标ID（项目ID或用户ID）' })
  @Column({ type: 'bigint' })
  target_id: number

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => Skill, (s) => s.visibilityList)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill
}

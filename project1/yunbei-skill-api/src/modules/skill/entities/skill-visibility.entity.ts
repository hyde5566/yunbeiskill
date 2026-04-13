import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Skill } from './skill.entity'

export type TargetType = 'project' | 'account'

@Entity('skill_visibility')
export class SkillVisibility {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'skill_id' })
  skillId: number

  @ManyToOne(() => Skill, skill => skill.visibilitySettings)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @Column({ name: 'target_type', length: 50 })
  targetType: TargetType

  @Column({ name: 'target_id' })
  targetId: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { Skill } from '../../skill/entities/skill.entity'
import { SkillVersion } from '../../skill/entities/skill-version.entity'

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'skill_id' })
  skillId: number

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @Column({ name: 'version_id', nullable: true })
  versionId: number | null

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'version_id' })
  version: SkillVersion | null

  @Column({ type: 'text' })
  content: string

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
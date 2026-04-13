import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SkillCategory } from '../../skill-category/entities/skill-category.entity'
import { User } from '../../user/entities/user.entity'
import { SkillVersion } from './skill-version.entity'
import { SkillVisibility } from './skill-visibility.entity'

export type SkillStatus = 'pending_review' | 'reviewing' | 'approved' | 'rejected' | 'published' | 'unpublished'
export type VisibilityType = 'all' | 'project' | 'account'
export type SourceType = 'internal' | 'external'

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'unique_id', length: 100, unique: true })
  uniqueId: string

  @Column({ length: 200 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'detail_description', type: 'text', nullable: true })
  detailDescription: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  author: string | null

  @Column({ name: 'category_id' })
  categoryId: number

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'category_id' })
  category: SkillCategory

  @Column({ name: 'source_type', length: 50 })
  sourceType: SourceType

  @Column({ name: 'source_name', type: 'varchar', length: 200, nullable: true })
  sourceName: string | null

  @Column({ name: 'submitter_id' })
  submitterId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitter_id' })
  submitter: User

  @Column({ length: 50, default: 'pending_review' })
  status: SkillStatus

  @Column({ name: 'visibility_type', length: 50, default: 'all' })
  visibilityType: VisibilityType

  @OneToMany(() => SkillVersion, version => version.skill)
  versions: SkillVersion[]

  @OneToMany(() => SkillVisibility, visibility => visibility.skill)
  visibilitySettings: SkillVisibility[]

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
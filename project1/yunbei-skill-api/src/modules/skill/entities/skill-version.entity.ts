import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Skill } from './skill.entity'
import { User } from '../../user/entities/user.entity'

export type VersionStatus = 'pending_review' | 'reviewing' | 'approved' | 'rejected' | 'published'

@Entity('skill_versions')
export class SkillVersion {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'skill_id' })
  skillId: number

  @ManyToOne(() => Skill, skill => skill.versions)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @Column({ name: 'version_number', length: 50 })
  versionNumber: string

  @Column({ name: 'zip_path', length: 500 })
  zipPath: string

  @Column({ name: 'zip_size' })
  zipSize: number

  @Column({ name: 'change_log', type: 'text', nullable: true })
  changeLog: string | null

  @Column({ name: 'uploader_id' })
  uploaderId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploader_id' })
  uploader: User

  @Column({ length: 50, default: 'pending_review' })
  status: VersionStatus

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/entities/user.entity'

export type NotificationType = 'skill_approved' | 'skill_rejected' | 'skill_published' | 'new_version' | 'feedback_received'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: NotificationType

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column({ type: 'text', nullable: true })
  content: string | null

  @Column({ name: 'related_skill_id', type: 'bigint', nullable: true })
  relatedSkillId: number | null

  @Column({ name: 'related_version_id', type: 'bigint', nullable: true })
  relatedVersionId: number | null

  @Column({ name: 'is_read', default: false })
  isRead: boolean

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
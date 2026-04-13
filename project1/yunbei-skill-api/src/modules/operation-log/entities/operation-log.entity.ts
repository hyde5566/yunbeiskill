import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/entities/user.entity'

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'varchar', length: 100 })
  module: string // 模块名称

  @Column({ type: 'varchar', length: 100 })
  action: string // 操作类型: create, update, delete, approve, etc.

  @Column({ name: 'target_type', type: 'varchar', length: 100, nullable: true })
  targetType: string | null // 目标类型: skill, user, project, etc.

  @Column({ name: 'target_id', type: 'bigint', nullable: true })
  targetId: number | null

  @Column({ type: 'text', nullable: true })
  detail: string | null // 操作详情JSON

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
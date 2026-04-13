import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ name: 'permission_id', type: 'bigint' })
  permissionId: number

  @Column({ name: 'assigned_by', type: 'bigint', nullable: true })
  assignedBy: number

  @Column({ name: 'assigned_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date
}
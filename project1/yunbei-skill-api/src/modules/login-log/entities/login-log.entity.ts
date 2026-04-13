import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ length: 50 })
  username: string

  @Column({ name: 'login_type', length: 50 })
  loginType: 'login' | 'logout'

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  device: string | null

  @Column({ default: 1 })
  status: number // 1=成功, 0=失败

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../user/entities/user.entity'

@Entity('operation_logs')
export class OperationLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '操作人ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: '模块' })
  @Column({ length: 100 })
  module: string

  @ApiProperty({ description: '动作' })
  @Column({ length: 100 })
  action: string

  @ApiProperty({ description: '目标类型' })
  @Column({ length: 100, nullable: true })
  target_type: string

  @ApiProperty({ description: '目标ID' })
  @Column({ type: 'bigint', nullable: true })
  target_id: number

  @ApiProperty({ description: '操作详情' })
  @Column({ type: 'text', nullable: true })
  detail: string

  @ApiProperty({ description: 'IP地址' })
  @Column({ length: 50, nullable: true })
  ip_address: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}

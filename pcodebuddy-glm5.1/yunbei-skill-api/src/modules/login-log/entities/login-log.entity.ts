import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('login_logs')
export class LoginLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: '账号' })
  @Column({ length: 50 })
  username: string

  @ApiProperty({ description: '类型（login/logout）' })
  @Column({ length: 50 })
  login_type: string

  @ApiProperty({ description: 'IP地址' })
  @Column({ length: 50, nullable: true })
  ip_address: string

  @ApiProperty({ description: '设备信息' })
  @Column({ length: 255, nullable: true })
  device: string

  @ApiProperty({ description: '状态（1=成功，0=失败）' })
  @Column({ type: 'tinyint', default: 1 })
  status: number

  @CreateDateColumn()
  created_at: Date
}

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
import { Permission } from './permission.entity'

@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: '权限ID' })
  @Column({ type: 'bigint' })
  permission_id: number

  @Column({ type: 'bigint', nullable: true })
  assigned_by: number

  @CreateDateColumn()
  assigned_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission
}

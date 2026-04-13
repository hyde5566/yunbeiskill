import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { UserPermission } from './user-permission.entity'

@Entity('permissions')
export class Permission {
  @ApiProperty({ description: '权限ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '权限代码' })
  @Column({ length: 50, unique: true })
  code: string

  @ApiProperty({ description: '权限名称' })
  @Column({ length: 100 })
  name: string

  @ApiProperty({ description: '权限描述' })
  @Column({ length: 255, nullable: true })
  description: string

  @CreateDateColumn()
  created_at: Date

  @OneToMany(() => UserPermission, (up) => up.permission)
  userPermissions: UserPermission[]
}

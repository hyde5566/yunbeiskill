import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Department } from '../../department/entities/department.entity'

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '账号' })
  @Column({ length: 50, unique: true })
  username: string

  @Column({ length: 255, select: false })
  password: string

  @ApiProperty({ description: '真实姓名' })
  @Column({ length: 100 })
  real_name: string

  @ApiProperty({ description: '所属部门ID' })
  @Column({ type: 'bigint', nullable: true })
  department_id: number

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 100, nullable: true })
  email: string

  @ApiProperty({ description: '手机号' })
  @Column({ length: 20, nullable: true })
  phone: string

  @ApiProperty({ description: '状态（1=正常，0=禁用）' })
  @Column({ type: 'tinyint', default: 1 })
  status: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department

  // 非数据库字段，登录后填充
  permissions?: string[]
}

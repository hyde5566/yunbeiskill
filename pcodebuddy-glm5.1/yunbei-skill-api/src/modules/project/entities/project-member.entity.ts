import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Project } from './project.entity'
import { User } from '../../user/entities/user.entity'

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '项目ID' })
  @Column({ type: 'bigint' })
  project_id: number

  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: '角色（owner/member）' })
  @Column({ length: 50, default: 'member' })
  role: string

  @CreateDateColumn()
  joined_at: Date

  @ManyToOne(() => Project, (p) => p.members)
  @JoinColumn({ name: 'project_id' })
  project: Project

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}

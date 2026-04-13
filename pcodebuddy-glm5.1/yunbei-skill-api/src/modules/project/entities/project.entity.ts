import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../user/entities/user.entity'
import { ProjectMember } from './project-member.entity'
import { ProjectSkill } from './project-skill.entity'

@Entity('projects')
export class Project {
  @ApiProperty({ description: '项目ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '项目名称' })
  @Column({ length: 200 })
  name: string

  @ApiProperty({ description: '项目描述' })
  @Column({ type: 'text', nullable: true })
  description: string

  @ApiProperty({ description: '项目负责人ID' })
  @Column({ type: 'bigint' })
  owner_id: number

  @ApiProperty({ description: '状态（active/archived）' })
  @Column({ length: 50, default: 'active' })
  status: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User

  @OneToMany(() => ProjectMember, (pm) => pm.project)
  members: ProjectMember[]

  @OneToMany(() => ProjectSkill, (ps) => ps.project)
  projectSkills: ProjectSkill[]
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Skill } from './skill.entity'
import { User } from '../../user/entities/user.entity'

@Entity('skill_versions')
export class SkillVersion {
  @ApiProperty({ description: '版本ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '版本号' })
  @Column({ length: 50 })
  version_number: string

  @ApiProperty({ description: '文件存储路径' })
  @Column({ length: 500 })
  zip_path: string

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({ type: 'bigint' })
  zip_size: number

  @ApiProperty({ description: '更新日志' })
  @Column({ type: 'text', nullable: true })
  change_log: string

  @ApiProperty({ description: '上传人ID' })
  @Column({ type: 'bigint' })
  uploader_id: number

  @ApiProperty({ description: '状态' })
  @Column({ length: 50, default: 'pending_review' })
  status: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => Skill, (s) => s.versions)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploader_id' })
  uploader: User
}

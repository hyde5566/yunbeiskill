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
import { Skill } from '../../skill/entities/skill.entity'
import { SkillVersion } from '../../skill/entities/skill-version.entity'

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: '通知ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '接收人ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: '通知类型' })
  @Column({ length: 50 })
  type: string

  @ApiProperty({ description: '通知标题' })
  @Column({ length: 200 })
  title: string

  @ApiProperty({ description: '通知内容' })
  @Column({ type: 'text', nullable: true })
  content: string

  @ApiProperty({ description: '关联SkillID' })
  @Column({ type: 'bigint', nullable: true })
  related_skill_id: number

  @ApiProperty({ description: '关联版本ID' })
  @Column({ type: 'bigint', nullable: true })
  related_version_id: number

  @ApiProperty({ description: '是否已读' })
  @Column({ type: 'tinyint', default: 0 })
  is_read: number

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'related_skill_id' })
  skill: Skill

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'related_version_id' })
  version: SkillVersion
}

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

@Entity('feedbacks')
export class Feedback {
  @ApiProperty({ description: '反馈ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '反馈人ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @Column({ type: 'bigint', nullable: true })
  version_id: number

  @ApiProperty({ description: '反馈内容' })
  @Column({ type: 'text' })
  content: string

  @ApiProperty({ description: '是否无效反馈' })
  @Column({ type: 'tinyint', default: 0 })
  is_invalid: number

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'version_id' })
  version: SkillVersion
}

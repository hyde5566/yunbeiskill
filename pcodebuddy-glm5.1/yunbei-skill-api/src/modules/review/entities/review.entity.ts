import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Skill } from '../../skill/entities/skill.entity'
import { SkillVersion } from '../../skill/entities/skill-version.entity'
import { User } from '../../user/entities/user.entity'

@Entity('reviews')
export class Review {
  @ApiProperty({ description: '审核ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @Column({ type: 'bigint' })
  version_id: number

  @ApiProperty({ description: '审核人ID' })
  @Column({ type: 'bigint' })
  reviewer_id: number

  @ApiProperty({ description: '分配人ID' })
  @Column({ type: 'bigint', nullable: true })
  assigned_by: number

  @ApiProperty({ description: '状态（pending/approved/rejected）' })
  @Column({ length: 50 })
  status: string

  @ApiProperty({ description: '审核意见' })
  @Column({ type: 'text', nullable: true })
  comment: string

  @ApiProperty({ description: '审核时间' })
  @Column({ type: 'datetime', nullable: true })
  reviewed_at: Date

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'version_id' })
  version: SkillVersion

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assigner: User
}

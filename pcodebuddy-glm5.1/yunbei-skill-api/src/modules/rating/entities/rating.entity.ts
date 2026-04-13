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

@Entity('ratings')
export class Rating {
  @ApiProperty({ description: '评分ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '评分人ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @Column({ type: 'bigint' })
  version_id: number

  @ApiProperty({ description: '评分（1-5）' })
  @Column({ type: 'int' })
  score: number

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

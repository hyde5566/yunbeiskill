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
import { Department } from '../../department/entities/department.entity'

@Entity('download_records')
export class DownloadRecord {
  @ApiProperty({ description: '记录ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '下载人ID' })
  @Column({ type: 'bigint' })
  user_id: number

  @ApiProperty({ description: 'SkillID' })
  @Column({ type: 'bigint' })
  skill_id: number

  @ApiProperty({ description: '版本ID' })
  @Column({ type: 'bigint' })
  version_id: number

  @ApiProperty({ description: '下载人所属部门ID' })
  @Column({ type: 'bigint' })
  department_id: number

  @ApiProperty({ description: '下载时间' })
  @CreateDateColumn()
  downloaded_at: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'version_id' })
  version: SkillVersion

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department
}

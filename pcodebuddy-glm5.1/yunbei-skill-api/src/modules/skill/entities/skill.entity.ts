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
import { SkillCategory } from '../../skill-category/entities/skill-category.entity'
import { User } from '../../user/entities/user.entity'
import { SkillVersion } from './skill-version.entity'
import { SkillVisibility } from './skill-visibility.entity'

@Entity('skills')
export class Skill {
  @ApiProperty({ description: 'Skill ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: 'Skill唯一标识' })
  @Column({ length: 100, unique: true })
  unique_id: string

  @ApiProperty({ description: 'Skill名称' })
  @Column({ length: 200 })
  name: string

  @ApiProperty({ description: '简介' })
  @Column({ length: 200 })
  summary: string

  @ApiProperty({ description: '详细说明' })
  @Column({ type: 'text', nullable: true })
  detail: string

  @ApiProperty({ description: '作者' })
  @Column({ length: 200 })
  author: string

  @ApiProperty({ description: '分类ID' })
  @Column({ type: 'bigint' })
  category_id: number

  @ApiProperty({ description: '来源类型（internal/external）' })
  @Column({ length: 50 })
  source_type: string

  @ApiProperty({ description: '来源网址' })
  @Column({ length: 500, nullable: true })
  source_url: string

  @ApiProperty({ description: '来源网址名称' })
  @Column({ length: 200, nullable: true })
  source_url_name: string

  @ApiProperty({ description: '提交人ID' })
  @Column({ type: 'bigint' })
  submitter_id: number

  @ApiProperty({ description: '状态' })
  @Column({ length: 50, default: 'pending_review' })
  status: string

  @ApiProperty({ description: '可见范围类型（all/project/account）' })
  @Column({ length: 50, default: 'all' })
  visibility_type: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'category_id' })
  category: SkillCategory

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitter_id' })
  submitter: User

  @OneToMany(() => SkillVersion, (v) => v.skill)
  versions: SkillVersion[]

  @OneToMany(() => SkillVisibility, (v) => v.skill)
  visibilityList: SkillVisibility[]
}

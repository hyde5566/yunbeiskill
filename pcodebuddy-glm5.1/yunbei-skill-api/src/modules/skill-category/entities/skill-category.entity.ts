import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('skill_categories')
export class SkillCategory {
  @ApiProperty({ description: '分类ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '分类名称' })
  @Column({ length: 100 })
  name: string

  @ApiProperty({ description: '分类描述' })
  @Column({ length: 255, nullable: true })
  description: string

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort_order: number

  @CreateDateColumn()
  created_at: Date
}

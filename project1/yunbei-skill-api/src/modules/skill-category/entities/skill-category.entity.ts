import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('skill_categories')
export class SkillCategory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 100 })
  name: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
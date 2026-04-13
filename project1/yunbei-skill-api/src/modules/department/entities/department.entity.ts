import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 100 })
  name: string

  @Column({ name: 'parent_id', nullable: true, type: 'bigint' })
  parentId: number | null

  @Column({ default: 1 })
  level: number

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
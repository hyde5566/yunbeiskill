import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 50, unique: true })
  code: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 255, nullable: true })
  description: string

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
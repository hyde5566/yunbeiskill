import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Department } from '../../department/entities/department.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 50, unique: true })
  username: string

  @Column({ length: 255 })
  password: string

  @Column({ length: 100, name: 'real_name' })
  realName: string

  @Column({ name: 'department_id' })
  departmentId: number

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @Column({ length: 100, nullable: true, type: 'varchar' })
  email: string | null

  @Column({ length: 20, nullable: true, type: 'varchar' })
  phone: string | null

  @Column({ type: 'tinyint', default: 1 })
  status: number

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
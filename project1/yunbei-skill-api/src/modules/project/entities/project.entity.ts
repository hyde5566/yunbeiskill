import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import { User } from '../../user/entities/user.entity'

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ length: 200 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'owner_id', nullable: true, type: 'bigint' })
  ownerId: number | null

  @Column({ default: 'active' })
  status: string

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  members: User[]
}
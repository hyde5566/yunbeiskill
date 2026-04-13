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

@Entity('departments')
export class Department {
  @ApiProperty({ description: '部门ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @ApiProperty({ description: '部门名称' })
  @Column({ length: 100 })
  name: string

  @ApiProperty({ description: '父部门ID' })
  @Column({ type: 'bigint', nullable: true })
  parent_id: number

  @ApiProperty({ description: '层级' })
  @Column({ default: 1 })
  level: number

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort_order: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(() => Department, (d) => d.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Department

  @OneToMany(() => Department, (d) => d.parent)
  children: Department[]
}

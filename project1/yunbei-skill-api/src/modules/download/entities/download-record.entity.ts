import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { Skill } from '../../skill/entities/skill.entity'
import { SkillVersion } from '../../skill/entities/skill-version.entity'
import { Department } from '../../department/entities/department.entity'

@Entity('download_records')
export class DownloadRecord {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'skill_id' })
  skillId: number

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill

  @Column({ name: 'version_id' })
  versionId: number

  @ManyToOne(() => SkillVersion)
  @JoinColumn({ name: 'version_id' })
  version: SkillVersion

  @Column({ name: 'department_id' })
  departmentId: number

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @Column({ name: 'downloaded_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  downloadedAt: Date
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Project } from './entities/project.entity'
import { User } from '../user/entities/user.entity'
import { Skill } from '../skill/entities/skill.entity'
import { SkillVisibility } from '../skill/entities/skill-visibility.entity'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(SkillVisibility)
    private visibilityRepo: Repository<SkillVisibility>
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description
    })

    // 添加成员
    if (dto.memberIds && dto.memberIds.length > 0) {
      project.members = await this.userRepo.find({ where: { id: In(dto.memberIds) } })
    }

    return this.projectRepo.save(project)
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id)

    if (dto.name) project.name = dto.name
    if (dto.description !== undefined) project.description = dto.description

    // 更新成员
    if (dto.memberIds !== undefined) {
      project.members = dto.memberIds.length > 0
        ? await this.userRepo.find({ where: { id: In(dto.memberIds) } })
        : []
    }

    return this.projectRepo.save(project)
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['members']
    })
    if (!project) throw new NotFoundException('项目不存在')
    return project
  }

  async remove(id: number): Promise<void> {
    // 检查是否有Skill可见性关联
    const visibilityCount = await this.visibilityRepo.count({
      where: { targetType: 'project', targetId: id }
    })
    if (visibilityCount > 0) {
      throw new BadRequestException('项目存在关联的Skill可见性设置，无法删除')
    }
    const project = await this.findById(id)
    await this.projectRepo.remove(project)
  }

  async list(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['members'],
      order: { createdAt: 'DESC' }
    })
  }

  async addMembers(id: number, userIds: number[]): Promise<Project> {
    const project = await this.findById(id)
    const users = await this.userRepo.find({ where: { id: In(userIds) } })

    // 合并新成员，避免重复
    const existingIds = project.members.map(m => m.id)
    const newUsers = users.filter(u => !existingIds.includes(u.id))
    project.members = [...project.members, ...newUsers]

    return this.projectRepo.save(project)
  }

  async removeMember(id: number, userId: number): Promise<Project> {
    const project = await this.findById(id)
    project.members = project.members.filter(m => m.id !== userId)
    return this.projectRepo.save(project)
  }

  async getMembers(id: number): Promise<User[]> {
    const project = await this.findById(id)
    return project.members
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project-member.entity'
import { ProjectSkill } from './entities/project-skill.entity'
import { CreateProjectDto, UpdateProjectDto, AddProjectMembersDto, AddProjectSkillDto } from './dto/project.dto'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectSkill)
    private projectSkillRepository: Repository<ProjectSkill>,
  ) {}

  async create(createDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createDto)
    const saved = await this.projectRepository.save(project)

    // 自动将负责人添加为项目owner
    const member = this.projectMemberRepository.create({
      project_id: saved.id,
      user_id: createDto.owner_id,
      role: 'owner',
    })
    await this.projectMemberRepository.save(member)

    return saved
  }

  async findAll(pagination: PaginationDto, keyword?: string): Promise<PaginatedResult<Project>> {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')

    if (keyword) {
      query.where('project.name LIKE :keyword', { keyword: `%${keyword}%` })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('project.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    })
    if (!project) {
      throw new NotFoundException('项目不存在')
    }
    return project
  }

  async update(id: number, updateDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id)
    Object.assign(project, updateDto)
    return this.projectRepository.save(project)
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id)

    // 检查是否有关联skill
    const skillCount = await this.projectSkillRepository.count({
      where: { project_id: id },
    })
    if (skillCount > 0) {
      throw new BadRequestException('该项目下有关联Skill，无法删除')
    }

    await this.projectMemberRepository.delete({ project_id: id })
    await this.projectRepository.remove(project)
  }

  // 项目成员管理
  async getMembers(projectId: number) {
    await this.findOne(projectId)
    return this.projectMemberRepository.find({
      where: { project_id: projectId },
      relations: ['user'],
    })
  }

  async addMembers(projectId: number, dto: AddProjectMembersDto) {
    await this.findOne(projectId)
    const members = dto.user_ids.map((userId) =>
      this.projectMemberRepository.create({
        project_id: projectId,
        user_id: userId,
        role: 'member',
      }),
    )
    // 使用 save 并忽略重复
    for (const member of members) {
      const exists = await this.projectMemberRepository.findOne({
        where: { project_id: projectId, user_id: member.user_id },
      })
      if (!exists) {
        await this.projectMemberRepository.save(member)
      }
    }
  }

  async removeMember(projectId: number, userId: number) {
    const member = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    })
    if (member && member.role === 'owner') {
      throw new BadRequestException('不能移除项目负责人')
    }
    await this.projectMemberRepository.delete({ project_id: projectId, user_id: userId })
  }

  // 项目关联Skill
  async addSkills(projectId: number, dto: AddProjectSkillDto) {
    await this.findOne(projectId)
    for (const skillId of dto.skill_ids) {
      const exists = await this.projectSkillRepository.findOne({
        where: { project_id: projectId, skill_id: skillId },
      })
      if (!exists) {
        const ps = this.projectSkillRepository.create({
          project_id: projectId,
          skill_id: skillId,
        })
        await this.projectSkillRepository.save(ps)
      }
    }
  }

  async removeSkill(projectId: number, skillId: number) {
    await this.projectSkillRepository.delete({ project_id: projectId, skill_id: skillId })
  }

  async getUserProjectIds(userId: number): Promise<number[]> {
    const members = await this.projectMemberRepository.find({
      where: { user_id: userId },
    })
    return members.map((m) => m.project_id)
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { Skill } from './entities/skill.entity'
import { SkillVersion } from './entities/skill-version.entity'
import { SkillVisibility } from './entities/skill-visibility.entity'
import { CreateSkillDto } from './dto/create-skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'
import { CreateSkillVersionDto } from './dto/create-skill-version.dto'

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(SkillVersion)
    private versionRepo: Repository<SkillVersion>,
    @InjectRepository(SkillVisibility)
    private visibilityRepo: Repository<SkillVisibility>
  ) {}

  async create(dto: CreateSkillDto, userId: number): Promise<Skill> {
    // 创建Skill
    const skill = this.skillRepo.create({
      uniqueId: randomUUID(),
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      sourceType: dto.sourceType,
      sourceName: dto.sourceName,
      submitterId: userId,
      status: 'pending_review',
      visibilityType: dto.visibilityType
    })

    const savedSkill = await this.skillRepo.save(skill)

    // 创建可见范围设置
    if (dto.visibilityType !== 'all' && dto.visibilityTargets && dto.visibilityTargets.length > 0) {
      const visibilityRecords = dto.visibilityTargets.map(targetId =>
        this.visibilityRepo.create({
          skillId: savedSkill.id,
          targetType: dto.visibilityType as 'project' | 'account',
          targetId
        })
      )
      await this.visibilityRepo.save(visibilityRecords)
    }

    return this.findById(savedSkill.id)
  }

  async update(id: number, dto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findById(id)

    if (dto.name) skill.name = dto.name
    if (dto.description !== undefined) skill.description = dto.description
    if (dto.detailDescription !== undefined) skill.detailDescription = dto.detailDescription
    if (dto.author !== undefined) skill.author = dto.author
    if (dto.categoryId) skill.categoryId = dto.categoryId
    if (dto.sourceType) skill.sourceType = dto.sourceType as any
    if (dto.sourceName !== undefined) skill.sourceName = dto.sourceName

    // 更新可见范围
    if (dto.visibilityType) {
      skill.visibilityType = dto.visibilityType as any
      // 删除旧设置
      await this.visibilityRepo.delete({ skillId: id })
      // 创建新设置
      if (dto.visibilityType !== 'all' && dto.visibilityTargets && dto.visibilityTargets.length > 0) {
        const visibilityRecords = dto.visibilityTargets.map(targetId =>
          this.visibilityRepo.create({
            skillId: id,
            targetType: dto.visibilityType as 'project' | 'account',
            targetId
          })
        )
        await this.visibilityRepo.save(visibilityRecords)
      }
    }

    // 编辑后重新进入待审核状态
    skill.status = 'pending_review'

    return this.skillRepo.save(skill)
  }

  // 用户修改已驳回的Skill并重新提交
  async resubmit(id: number, dto: UpdateSkillDto, userId: number): Promise<Skill> {
    const skill = await this.findById(id)

    // 验证权限：只有提交方可以修改
    if (skill.submitterId !== userId) {
      throw new ForbiddenException('只有原提交方可以修改')
    }

    // 验证状态：只有已驳回状态可以修改重新提交
    if (skill.status !== 'rejected') {
      throw new ForbiddenException('只有已驳回的Skill可以修改重新提交')
    }

    // 更新字段
    if (dto.name) skill.name = dto.name
    if (dto.description !== undefined) skill.description = dto.description
    if (dto.categoryId) skill.categoryId = dto.categoryId
    if (dto.sourceType) skill.sourceType = dto.sourceType as any
    if (dto.sourceName !== undefined) skill.sourceName = dto.sourceName

    // 更新可见范围
    if (dto.visibilityType) {
      skill.visibilityType = dto.visibilityType as any
      await this.visibilityRepo.delete({ skillId: id })
      if (dto.visibilityType !== 'all' && dto.visibilityTargets && dto.visibilityTargets.length > 0) {
        const visibilityRecords = dto.visibilityTargets.map(targetId =>
          this.visibilityRepo.create({
            skillId: id,
            targetType: dto.visibilityType as 'project' | 'account',
            targetId
          })
        )
        await this.visibilityRepo.save(visibilityRecords)
      }
    }

    // 重置为待审核状态
    skill.status = 'pending_review'

    return this.skillRepo.save(skill)
  }

  async findById(id: number): Promise<Skill> {
    const skill = await this.skillRepo.findOne({
      where: { id },
      relations: ['category', 'submitter', 'versions', 'visibilitySettings']
    })
    if (!skill) throw new NotFoundException('Skill不存在')
    return skill
  }

  async list(params: {
    keyword?: string
    categoryId?: number
    sourceType?: string
    status?: string
    userId?: number
    isReview?: boolean
    page?: number
    pageSize?: number
  }) {
    const qb = this.skillRepo.createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.submitter', 'submitter')
      .leftJoinAndSelect('skill.versions', 'versions')

    // 关键词搜索
    if (params.keyword) {
      qb.andWhere('skill.name LIKE :keyword OR skill.description LIKE :keyword',
        { keyword: `%${params.keyword}%` })
    }

    // 分类筛选
    if (params.categoryId) {
      qb.andWhere('skill.categoryId = :categoryId', { categoryId: params.categoryId })
    }

    // 来源筛选
    if (params.sourceType) {
      qb.andWhere('skill.sourceType = :sourceType', { sourceType: params.sourceType })
    }

    // 状态筛选
    if (params.status) {
      qb.andWhere('skill.status = :status', { status: params.status })
    }

    // 审核员查看待审核任务
    if (params.isReview) {
      qb.andWhere('skill.status IN (:...reviewStatuses)',
        { reviewStatuses: ['pending_review', 'reviewing'] })
    }

    // 用户查看自己提交的
    if (params.userId && !params.isReview) {
      qb.andWhere('skill.submitterId = :userId', { userId: params.userId })
    }

    // 已发布的公开列表（普通员工）
    if (!params.userId && !params.isReview && !params.status) {
      qb.andWhere('skill.status = :publishedStatus', { publishedStatus: 'published' })
    }

    const page = params.page || 1
    const pageSize = params.pageSize || 20
    qb.skip((page - 1) * pageSize).take(pageSize)
    qb.orderBy('skill.createdAt', 'DESC')

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  async addVersion(id: number, dto: CreateSkillVersionDto, userId: number): Promise<SkillVersion> {
    const skill = await this.findById(id)

    // 只有提交方或管理员可以添加版本
    if (skill.submitterId !== userId) {
      throw new ForbiddenException('只有原提交方可以添加新版本')
    }

    const version = this.versionRepo.create({
      skillId: id,
      versionNumber: dto.versionNumber,
      zipPath: dto.zipPath,
      zipSize: dto.zipSize,
      changeLog: dto.changeLog,
      uploaderId: userId,
      status: 'pending_review'
    })

    return this.versionRepo.save(version)
  }

  async getVersions(id: number): Promise<SkillVersion[]> {
    return this.versionRepo.find({
      where: { skillId: id },
      order: { createdAt: 'DESC' }
    })
  }

  // 获取待审核版本列表（已发布的Skill有新版本待审核）
  async listPendingVersions(params: { page?: number; pageSize?: number }) {
    const qb = this.versionRepo.createQueryBuilder('version')
      .leftJoinAndSelect('version.skill', 'skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.submitter', 'submitter')
      .leftJoinAndSelect('version.uploader', 'uploader')
      .where('version.status = :status', { status: 'pending_review' })
      .andWhere('skill.status = :skillStatus', { skillStatus: 'published' })
      .orderBy('version.createdAt', 'DESC')

    const page = params.page || 1
    const pageSize = params.pageSize || 20
    qb.skip((page - 1) * pageSize).take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  // 审核通过版本
  async approveVersion(skillId: number, versionId: number): Promise<SkillVersion> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId, skillId },
      relations: ['skill']
    })
    if (!version) {
      throw new NotFoundException('版本不存在')
    }
    if (version.status !== 'pending_review') {
      throw new ForbiddenException('只有待审核的版本可以审核')
    }
    version.status = 'published'
    return this.versionRepo.save(version)
  }

  // 审核驳回版本
  async rejectVersion(skillId: number, versionId: number, reason: string): Promise<SkillVersion> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId, skillId },
      relations: ['skill']
    })
    if (!version) {
      throw new NotFoundException('版本不存在')
    }
    if (version.status !== 'pending_review') {
      throw new ForbiddenException('只有待审核的版本可以审核')
    }
    version.status = 'rejected'
    return this.versionRepo.save(version)
  }

  async remove(id: number): Promise<void> {
    const skill = await this.findById(id)
    await this.visibilityRepo.delete({ skillId: id })
    await this.versionRepo.delete({ skillId: id })
    await this.skillRepo.remove(skill)
  }

  // 审核相关
  async approve(id: number): Promise<Skill> {
    const skill = await this.findById(id)
    skill.status = 'approved'
    return this.skillRepo.save(skill)
  }

  async reject(id: number, reason: string): Promise<Skill> {
    const skill = await this.findById(id)
    skill.status = 'rejected'
    // 可以存储驳回原因到review表（后续实现）
    return this.skillRepo.save(skill)
  }

  async publish(id: number): Promise<Skill> {
    const skill = await this.findById(id)
    if (skill.status !== 'approved') {
      throw new ForbiddenException('只有已审核通过的Skill可以发布')
    }
    skill.status = 'published'
    // 同时发布所有待审核版本
    const pendingVersions = await this.versionRepo.find({
      where: { skillId: id, status: 'pending_review' }
    })
    for (const v of pendingVersions) {
      v.status = 'published'
      await this.versionRepo.save(v)
    }
    return this.skillRepo.save(skill)
  }

  async unpublish(id: number): Promise<Skill> {
    const skill = await this.findById(id)
    if (skill.status !== 'published') {
      throw new ForbiddenException('只有已发布的Skill可以下架')
    }
    skill.status = 'unpublished'
    return this.skillRepo.save(skill)
  }

  // 检查用户是否有权限查看该Skill
  checkVisibility(skill: Skill, userId: number, userProjectIds: number[]): boolean {
    if (skill.visibilityType === 'all') return true

    if (skill.visibilityType === 'project') {
      const skillProjectIds = skill.visibilitySettings?.map(v => v.targetId) || []
      return skillProjectIds.some(pid => userProjectIds.includes(pid))
    }

    if (skill.visibilityType === 'account') {
      const skillUserIds = skill.visibilitySettings?.map(v => v.targetId) || []
      return skillUserIds.includes(userId)
    }

    return false
  }
}
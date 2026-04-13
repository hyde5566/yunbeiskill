import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'
import { Skill } from './entities/skill.entity'
import { SkillVersion } from './entities/skill-version.entity'
import { SkillVisibility } from './entities/skill-visibility.entity'
import { ProjectSkill } from '../project/entities/project-skill.entity'
import { CreateSkillDto, UpdateSkillDto, SubmitVersionDto, SkillQueryDto } from './dto/skill.dto'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(SkillVersion)
    private skillVersionRepository: Repository<SkillVersion>,
    @InjectRepository(SkillVisibility)
    private skillVisibilityRepository: Repository<SkillVisibility>,
    @InjectRepository(ProjectSkill)
    private projectSkillRepository: Repository<ProjectSkill>,
  ) {}

  // 创建Skill
  async create(createDto: CreateSkillDto, submitterId: number, zipPath: string, zipSize: number) {
    if (createDto.source_type === 'external' && !createDto.source_url) {
      throw new BadRequestException('外部平台Skill必须填写来源网址')
    }
    if (createDto.visibility_type === 'account' && (!createDto.visibility_account_ids || createDto.visibility_account_ids.length === 0)) {
      throw new BadRequestException('指定账号可见时必须选择可见账号')
    }

    const skill = this.skillRepository.create({
      unique_id: uuidv4(),
      name: createDto.name,
      summary: createDto.summary,
      detail: createDto.detail,
      author: createDto.author,
      category_id: createDto.category_id,
      source_type: createDto.source_type,
      source_url: createDto.source_url,
      source_url_name: createDto.source_url_name,
      submitter_id: submitterId,
      status: 'pending_review',
      visibility_type: createDto.visibility_type,
    })
    const savedSkill = await this.skillRepository.save(skill)

    // 创建版本
    const version = this.skillVersionRepository.create({
      skill_id: savedSkill.id,
      version_number: createDto.version_number,
      zip_path: zipPath,
      zip_size: zipSize,
      change_log: createDto.change_log,
      uploader_id: submitterId,
      status: 'pending_review',
    })
    await this.skillVersionRepository.save(version)

    // 设置可见范围
    await this.setVisibility(savedSkill.id, createDto)

    // 关联项目
    if (createDto.project_ids && createDto.project_ids.length > 0) {
      await this.setProjectSkills(savedSkill.id, createDto.project_ids)
    }

    return this.findOne(savedSkill.id)
  }

  // 设置可见范围
  private async setVisibility(skillId: number, dto: CreateSkillDto | UpdateSkillDto) {
    await this.skillVisibilityRepository.delete({ skill_id: skillId })

    if (dto.visibility_type === 'project' && dto.project_ids) {
      for (const projectId of dto.project_ids) {
        const v = this.skillVisibilityRepository.create({
          skill_id: skillId,
          target_type: 'project',
          target_id: projectId,
        })
        await this.skillVisibilityRepository.save(v)
      }
    }

    if (dto.visibility_type === 'account' && dto.visibility_account_ids) {
      for (const accountId of dto.visibility_account_ids) {
        const v = this.skillVisibilityRepository.create({
          skill_id: skillId,
          target_type: 'account',
          target_id: accountId,
        })
        await this.skillVisibilityRepository.save(v)
      }
    }
  }

  // 设置项目关联
  private async setProjectSkills(skillId: number, projectIds: number[]) {
    await this.projectSkillRepository.delete({ skill_id: skillId })
    for (const projectId of projectIds) {
      const ps = this.projectSkillRepository.create({
        project_id: projectId,
        skill_id: skillId,
      })
      await this.projectSkillRepository.save(ps)
    }
  }

  // 获取Skill列表（检索中心，需过滤可见范围）
  async findPublished(pagination: PaginationDto, query: SkillQueryDto, userId: number, userPermissions: string[], userProjectIds: number[]) {
    const queryBuilder = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.submitter', 'submitter')
      .leftJoinAndSelect('skill.versions', 'version')
      .where('skill.status = :status', { status: 'published' })

    // 可见范围过滤（admin可看全部）
    if (!userPermissions.includes('admin')) {
      queryBuilder.andWhere(
        '(skill.visibility_type = :allVis OR ' +
        '(skill.visibility_type = :projectVis AND EXISTS (' +
        'SELECT 1 FROM skill_visibility sv WHERE sv.skill_id = skill.id AND sv.target_type = :projectType AND sv.target_id IN (:...projectIds)' +
        ')) OR ' +
        '(skill.visibility_type = :accountVis AND EXISTS (' +
        'SELECT 1 FROM skill_visibility sv WHERE sv.skill_id = skill.id AND sv.target_type = :accountType AND sv.target_id = :userId' +
        ')))',
        {
          allVis: 'all',
          projectVis: 'project',
          projectType: 'project',
          projectIds: userProjectIds.length > 0 ? userProjectIds : [0],
          accountVis: 'account',
          accountType: 'account',
          userId,
        },
      )
    }

    if (query.keyword) {
      queryBuilder.andWhere(
        '(skill.name LIKE :keyword OR skill.summary LIKE :keyword OR skill.detail LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      )
    }
    if (query.category_id) {
      queryBuilder.andWhere('skill.category_id = :categoryId', { categoryId: query.category_id })
    }
    if (query.source_type) {
      queryBuilder.andWhere('skill.source_type = :sourceType', { sourceType: query.source_type })
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('skill.created_at', 'DESC')

    const [list, total] = await queryBuilder.getManyAndCount()
    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 管理员获取所有Skill
  async findAll(pagination: PaginationDto, query: SkillQueryDto) {
    const queryBuilder = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.submitter', 'submitter')

    if (query.keyword) {
      queryBuilder.andWhere(
        '(skill.name LIKE :keyword OR skill.summary LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      )
    }
    if (query.category_id) {
      queryBuilder.andWhere('skill.category_id = :categoryId', { categoryId: query.category_id })
    }
    if (query.source_type) {
      queryBuilder.andWhere('skill.source_type = :sourceType', { sourceType: query.source_type })
    }
    if (query.status) {
      queryBuilder.andWhere('skill.status = :status', { status: query.status })
    }

    const [list, total] = await queryBuilder
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('skill.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['category', 'submitter', 'versions', 'visibilityList'],
    })
    if (!skill) {
      throw new NotFoundException('Skill不存在')
    }
    return skill
  }

  // 更新Skill
  async update(id: number, updateDto: UpdateSkillDto, userId: number) {
    const skill = await this.findOne(id)

    // 只有管理员可编辑
    Object.assign(skill, updateDto)

    // 如果修改了可见范围
    if (updateDto.visibility_type) {
      await this.setVisibility(id, updateDto)
    }

    // 如果修改了项目关联
    if (updateDto.project_ids !== undefined) {
      await this.setProjectSkills(id, updateDto.project_ids)
    }

    // 编辑后需重新审核
    skill.status = 'pending_review'
    return this.skillRepository.save(skill)
  }

  // 提交新版本
  async submitVersion(skillId: number, dto: SubmitVersionDto, uploaderId: number, zipPath: string, zipSize: number) {
    const skill = await this.findOne(skillId)

    const version = this.skillVersionRepository.create({
      skill_id: skillId,
      version_number: dto.version_number,
      zip_path: zipPath,
      zip_size: zipSize,
      change_log: dto.change_log,
      uploader_id: uploaderId,
      status: 'pending_review',
    })
    await this.skillVersionRepository.save(version)

    // skill状态回退到待审核
    skill.status = 'pending_review'
    await this.skillRepository.save(skill)

    return version
  }

  // 获取Skill版本列表
  async getVersions(skillId: number) {
    return this.skillVersionRepository.find({
      where: { skill_id: skillId },
      order: { created_at: 'DESC' },
    })
  }

  // 获取最新已发布版本
  async getLatestPublishedVersion(skillId: number) {
    return this.skillVersionRepository.findOne({
      where: { skill_id: skillId, status: 'published' },
      order: { created_at: 'DESC' },
    })
  }

  // 获取我的提交记录
  async getMySubmissions(pagination: PaginationDto, submitterId: number) {
    const [list, total] = await this.skillRepository.findAndCount({
      where: { submitter_id: submitterId },
      relations: ['category'],
      skip: pagination.skip,
      take: pagination.take,
      order: { created_at: 'DESC' },
    })
    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 发布Skill
  async publish(id: number) {
    const skill = await this.findOne(id)
    if (skill.status !== 'approved') {
      throw new BadRequestException('只能发布已入库状态的Skill')
    }
    skill.status = 'published'
    await this.skillRepository.save(skill)

    // 发布最新已审核版本
    const latestApprovedVersion = await this.skillVersionRepository.findOne({
      where: { skill_id: id, status: 'approved' },
      order: { created_at: 'DESC' },
    })
    if (latestApprovedVersion) {
      latestApprovedVersion.status = 'published'
      await this.skillVersionRepository.save(latestApprovedVersion)
    }

    return skill
  }

  // 下架Skill
  async offline(id: number) {
    const skill = await this.findOne(id)
    skill.status = 'offline'
    return this.skillRepository.save(skill)
  }

  // 获取下载信息
  async getDownloadInfo(skillId: number, versionId: number) {
    const version = await this.skillVersionRepository.findOne({
      where: { id: versionId, skill_id: skillId },
    })
    if (!version) {
      throw new NotFoundException('版本不存在')
    }
    return {
      filePath: path.resolve(version.zip_path),
      fileName: `v${version.version_number}.zip`,
    }
  }
}

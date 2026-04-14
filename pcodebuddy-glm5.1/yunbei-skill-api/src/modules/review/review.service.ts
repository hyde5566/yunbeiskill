import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from './entities/review.entity'
import { Skill } from '../skill/entities/skill.entity'
import { SkillVersion } from '../skill/entities/skill-version.entity'
import { AssignReviewerDto, ReviewActionDto } from './dto/review.dto'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(SkillVersion)
    private skillVersionRepository: Repository<SkillVersion>,
  ) {}

  // 分配审核员
  async assignReviewer(assignDto: AssignReviewerDto, assignedBy: number) {
    const review = this.reviewRepository.create({
      skill_id: assignDto.skill_id,
      version_id: assignDto.version_id,
      reviewer_id: assignDto.reviewer_id,
      assigned_by: assignedBy,
      status: 'pending',
    })
    const saved = await this.reviewRepository.save(review)

    // 更新skill状态为审核中
    await this.skillRepository.update(assignDto.skill_id, { status: 'reviewing' })

    return saved
  }

  // 获取待审核列表
  async getPendingReviews(pagination: PaginationDto, reviewerId?: number, isAdmin?: boolean) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.skill', 'skill')
      .leftJoinAndSelect('skill.submitter', 'submitter')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('review.version', 'version')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.status = :status', { status: 'pending' })

    // 非admin用户只看分配给自己或未分配审核员的待审核任务
    if (reviewerId && !isAdmin) {
      query.andWhere('(review.reviewer_id = :reviewerId OR review.reviewer_id IS NULL)', { reviewerId })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('review.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 获取审核详情
  async findOne(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['skill', 'skill.submitter', 'skill.category', 'version', 'reviewer', 'assigner'],
    })
    if (!review) {
      throw new NotFoundException('审核记录不存在')
    }
    return review
  }

  // 获取某个Skill的所有审核记录（用于详情页历史）
  async getReviewsBySkillId(skillId: number) {
    return this.reviewRepository.find({
      where: { skill_id: skillId },
      relations: ['reviewer'],
      order: { created_at: 'DESC' },
    })
  }

  // 执行审核
  async reviewAction(reviewId: number, actionDto: ReviewActionDto, reviewerId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    })
    if (!review) {
      throw new NotFoundException('审核记录不存在')
    }
    // 如果已分配审核员，只有审核员本人可操作；如果未分配，任何有审核权限的人可操作
    if (review.reviewer_id !== null && Number(review.reviewer_id) !== Number(reviewerId)) {
      throw new BadRequestException('只能审核分配给自己的任务')
    }
    if (review.status !== 'pending') {
      throw new BadRequestException('该审核任务已处理')
    }

    // 如果未分配审核员，自动分配给当前操作人
    if (review.reviewer_id === null) {
      review.reviewer_id = reviewerId
    }

    review.status = actionDto.status
    review.comment = actionDto.comment || ''
    review.reviewed_at = new Date()
    await this.reviewRepository.save(review)

    // 更新skill状态
    if (actionDto.status === 'approved') {
      await this.skillRepository.update(review.skill_id, { status: 'approved' })
      await this.skillVersionRepository.update(review.version_id, { status: 'approved' })
    } else {
      await this.skillRepository.update(review.skill_id, { status: 'rejected' })
      await this.skillVersionRepository.update(review.version_id, { status: 'rejected' })
    }

    return review
  }

  // 获取审核记录
  async getReviewHistory(pagination: PaginationDto, skillId?: number) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.skill', 'skill')
      .leftJoinAndSelect('skill.submitter', 'submitter')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.assigner', 'assigner')

    if (skillId) {
      query.where('review.skill_id = :skillId', { skillId })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('review.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }
}

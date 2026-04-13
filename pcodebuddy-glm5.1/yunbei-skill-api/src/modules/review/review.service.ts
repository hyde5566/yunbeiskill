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
  async getPendingReviews(pagination: PaginationDto, reviewerId?: number) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.skill', 'skill')
      .leftJoinAndSelect('review.version', 'version')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.status = :status', { status: 'pending' })

    if (reviewerId) {
      query.andWhere('review.reviewer_id = :reviewerId', { reviewerId })
    }

    const [list, total] = await query
      .skip(pagination.skip)
      .take(pagination.take)
      .orderBy('review.created_at', 'DESC')
      .getManyAndCount()

    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 执行审核
  async reviewAction(reviewId: number, actionDto: ReviewActionDto, reviewerId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    })
    if (!review) {
      throw new NotFoundException('审核记录不存在')
    }
    if (review.reviewer_id !== reviewerId) {
      throw new BadRequestException('只能审核分配给自己的任务')
    }
    if (review.status !== 'pending') {
      throw new BadRequestException('该审核任务已处理')
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
    }

    return review
  }

  // 获取审核记录
  async getReviewHistory(pagination: PaginationDto, skillId?: number) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.skill', 'skill')
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

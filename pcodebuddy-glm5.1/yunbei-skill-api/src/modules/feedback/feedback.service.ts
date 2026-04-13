import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Feedback } from './entities/feedback.entity'
import { CreateFeedbackDto, MarkInvalidDto } from './dto/feedback.dto'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createDto: CreateFeedbackDto, userId: number) {
    // 每天最多3条反馈（防刷屏）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayFeedbackCount = await this.feedbackRepository.count({
      where: {
        user_id: userId,
        skill_id: createDto.skill_id,
      },
    })

    // 简单检查：最近24小时内的反馈数
    const recentCount = await this.feedbackRepository
      .createQueryBuilder('fb')
      .where('fb.user_id = :userId', { userId })
      .andWhere('fb.skill_id = :skillId', { skillId: createDto.skill_id })
      .andWhere('fb.created_at >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      .getCount()

    if (recentCount >= 3) {
      throw new BadRequestException('每天对每个Skill最多提交3条反馈')
    }

    const feedback = this.feedbackRepository.create({
      ...createDto,
      user_id: userId,
    })
    return this.feedbackRepository.save(feedback)
  }

  async getSkillFeedbacks(skillId: number, pagination: PaginationDto) {
    const [list, total] = await this.feedbackRepository.findAndCount({
      where: { skill_id: skillId, is_invalid: 0 },
      relations: ['user'],
      skip: pagination.skip,
      take: pagination.take,
      order: { created_at: 'DESC' },
    })
    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  async getMyFeedbacks(userId: number) {
    return this.feedbackRepository.find({
      where: { user_id: userId },
      relations: ['skill'],
      order: { created_at: 'DESC' },
    })
  }

  async markInvalid(id: number, dto: MarkInvalidDto) {
    const feedback = await this.feedbackRepository.findOne({ where: { id } })
    if (!feedback) {
      throw new NotFoundException('反馈不存在')
    }
    feedback.is_invalid = dto.is_invalid
    return this.feedbackRepository.save(feedback)
  }

  async findAll(pagination: PaginationDto) {
    const [list, total] = await this.feedbackRepository.findAndCount({
      relations: ['user', 'skill'],
      skip: pagination.skip,
      take: pagination.take,
      order: { created_at: 'DESC' },
    })
    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }
}

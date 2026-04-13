import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Feedback } from './entities/feedback.entity'
import { CreateFeedbackDto } from './dto/create-feedback.dto'

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>
  ) {}

  // 创建反馈
  async create(dto: CreateFeedbackDto, userId: number): Promise<Feedback> {
    const feedback = this.feedbackRepo.create({
      userId,
      skillId: dto.skillId,
      versionId: dto.versionId || null,
      content: dto.content
    })
    return this.feedbackRepo.save(feedback)
  }

  // 获取Skill的反馈列表
  async getSkillFeedbacks(skillId: number, page: number = 1, pageSize: number = 20) {
    const qb = this.feedbackRepo.createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .where('feedback.skillId = :skillId', { skillId })
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  // 获取用户提交的反馈
  async getUserFeedbacks(userId: number, page: number = 1, pageSize: number = 20) {
    const qb = this.feedbackRepo.createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.skill', 'skill')
      .where('feedback.userId = :userId', { userId })
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }
}
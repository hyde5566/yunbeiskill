import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Rating } from './entities/rating.entity'
import { CreateRatingDto } from './dto/rating.dto'

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  async create(createDto: CreateRatingDto, userId: number) {
    // 检查是否已评分
    const existing = await this.ratingRepository.findOne({
      where: {
        user_id: userId,
        skill_id: createDto.skill_id,
        version_id: createDto.version_id,
      },
    })
    if (existing) {
      throw new BadRequestException('您已对该版本评过分')
    }

    const rating = this.ratingRepository.create({
      ...createDto,
      user_id: userId,
    })
    return this.ratingRepository.save(rating)
  }

  async getSkillRatings(skillId: number) {
    const ratings = await this.ratingRepository.find({
      where: { skill_id: skillId },
    })

    const total = ratings.length
    const avgScore = total > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / total
      : 0

    // 评分分布
    const distribution = [0, 0, 0, 0, 0]
    ratings.forEach((r) => {
      distribution[r.score - 1]++
    })

    return {
      skill_id: skillId,
      average_score: Math.round(avgScore * 10) / 10,
      total_count: total,
      distribution,
    }
  }

  async getMyRatings(userId: number) {
    return this.ratingRepository.find({
      where: { user_id: userId },
      relations: ['skill', 'version'],
      order: { created_at: 'DESC' },
    })
  }
}

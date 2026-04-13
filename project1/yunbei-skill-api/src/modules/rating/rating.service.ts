import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Rating } from './entities/rating.entity'
import { CreateRatingDto } from './dto/create-rating.dto'

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepo: Repository<Rating>
  ) {}

  // 创建或更新评分（一个用户对一个Skill只能评一次）
  async rate(dto: CreateRatingDto, userId: number): Promise<Rating> {
    // 查找是否已评分
    const existing = await this.ratingRepo.findOne({
      where: { userId, skillId: dto.skillId }
    })

    if (existing) {
      // 更新评分
      existing.score = dto.score
      if (dto.versionId) existing.versionId = dto.versionId
      return this.ratingRepo.save(existing)
    }

    // 新评分
    const rating = this.ratingRepo.create({
      userId,
      skillId: dto.skillId,
      versionId: dto.versionId || null,
      score: dto.score
    })
    return this.ratingRepo.save(rating)
  }

  // 获取用户对Skill的评分
  async getUserRating(skillId: number, userId: number): Promise<Rating | null> {
    return this.ratingRepo.findOne({
      where: { skillId, userId }
    })
  }

  // 获取Skill的平均评分
  async getSkillRatingStats(skillId: number): Promise<{ average: number; total: number; distribution: Record<number, number> }> {
    const ratings = await this.ratingRepo.find({ where: { skillId } })

    if (ratings.length === 0) {
      return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    }

    const total = ratings.length
    const sum = ratings.reduce((acc, r) => acc + r.score, 0)
    const average = sum / total

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach(r => {
      distribution[r.score]++
    })

    return { average, total, distribution }
  }
}
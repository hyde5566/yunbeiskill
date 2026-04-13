import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Skill } from '../skill/entities/skill.entity'
import { User } from '../user/entities/user.entity'
import { Rating } from '../rating/entities/rating.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'
import { Review } from '../review/entities/review.entity'
import { Feedback } from '../feedback/entities/feedback.entity'
import { Project } from '../project/entities/project.entity'
import { SkillCategory } from '../skill-category/entities/skill-category.entity'

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(DownloadRecord)
    private downloadRepository: Repository<DownloadRecord>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(SkillCategory)
    private categoryRepository: Repository<SkillCategory>,
  ) {}

  // 全局统计概览
  async getOverview() {
    const [skillTotal, publishedTotal, userTotal, ratingTotal, downloadTotal, reviewTotal, feedbackTotal] = await Promise.all([
      this.skillRepository.count(),
      this.skillRepository.count({ where: { status: 'published' } }),
      this.userRepository.count({ where: { status: 1 } }),
      this.ratingRepository.count(),
      this.downloadRepository.count(),
      this.reviewRepository.count(),
      this.feedbackRepository.count(),
    ])

    return {
      skill_total: skillTotal,
      published_total: publishedTotal,
      user_total: userTotal,
      rating_total: ratingTotal,
      download_total: downloadTotal,
      review_total: reviewTotal,
      feedback_total: feedbackTotal,
    }
  }

  // 仪表盘数据
  async getDashboard() {
    const overview = await this.getOverview()
    const categoryStats = await this.getByCategory()
    const topDownloads = await this.getTopDownloads(5)
    const ratingDistribution = await this.getRatingDistribution()
    return { overview, categoryStats, topDownloads, ratingDistribution }
  }

  // 分类统计
  async getByCategory() {
    return this.skillRepository
      .createQueryBuilder('skill')
      .leftJoin('skill.category', 'category')
      .select('category.name', 'category_name')
      .addSelect('category.id', 'category_id')
      .addSelect('COUNT(*)', 'skill_count')
      .groupBy('skill.category_id')
      .getRawMany()
  }

  // 下载Top统计
  async getTopDownloads(limit: number = 10) {
    return this.downloadRepository
      .createQueryBuilder('dr')
      .leftJoin('dr.skill', 'skill')
      .select('skill.name', 'skill_name')
      .addSelect('skill.id', 'skill_id')
      .addSelect('COUNT(*)', 'download_count')
      .groupBy('dr.skill_id')
      .orderBy('download_count', 'DESC')
      .limit(limit)
      .getRawMany()
  }

  // 评分分布
  async getRatingDistribution() {
    const distribution = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.score', 'score')
      .addSelect('COUNT(*)', 'count')
      .groupBy('rating.score')
      .orderBy('rating.score', 'ASC')
      .getRawMany()

    const avgResult = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'avg_score')
      .getRawOne()

    return {
      distribution,
      avg_score: avgResult?.avg_score ? parseFloat(avgResult.avg_score).toFixed(2) : '0.00',
    }
  }

  // 下载趋势
  async getDownloadTrend(months: number = 6) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    return this.downloadRepository
      .createQueryBuilder('dr')
      .select("DATE_FORMAT(dr.downloaded_at, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('dr.downloaded_at >= :startDate', { startDate })
      .groupBy("DATE_FORMAT(dr.downloaded_at, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany()
  }

  // 评分统计
  async getByRating() {
    const topRated = await this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoin('rating.skill', 'skill')
      .select('skill.name', 'skill_name')
      .addSelect('skill.id', 'skill_id')
      .addSelect('AVG(rating.score)', 'avg_score')
      .addSelect('COUNT(*)', 'rating_count')
      .groupBy('rating.skill_id')
      .orderBy('avg_score', 'DESC')
      .limit(10)
      .getRawMany()

    return { top_rated: topRated }
  }

  // 下载统计
  async getByDownload() {
    const topDownloaded = await this.downloadRepository
      .createQueryBuilder('dr')
      .leftJoin('dr.skill', 'skill')
      .select('skill.name', 'skill_name')
      .addSelect('skill.id', 'skill_id')
      .addSelect('COUNT(*)', 'download_count')
      .groupBy('dr.skill_id')
      .orderBy('download_count', 'DESC')
      .limit(10)
      .getRawMany()

    return { top_downloaded: topDownloaded }
  }

  // 项目统计
  async getByProject() {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.skills', 'ps')
      .select('project.name', 'project_name')
      .addSelect('project.id', 'project_id')
      .addSelect('COUNT(ps.id)', 'skill_count')
      .groupBy('project.id')
      .orderBy('skill_count', 'DESC')
      .getRawMany()
  }

  // 用户统计
  async getByUser() {
    return this.skillRepository
      .createQueryBuilder('skill')
      .select('skill.submitted_by', 'user_id')
      .addSelect('COUNT(*)', 'submit_count')
      .groupBy('skill.submitted_by')
      .orderBy('submit_count', 'DESC')
      .limit(10)
      .getRawMany()
  }

  // 时间维度统计
  async getTimeline(startDate: string, endDate: string) {
    const downloadTrend = await this.downloadRepository
      .createQueryBuilder('dr')
      .select('DATE(dr.downloaded_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('dr.downloaded_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(dr.downloaded_at)')
      .orderBy('date', 'ASC')
      .getRawMany()

    const submitTrend = await this.skillRepository
      .createQueryBuilder('skill')
      .select('DATE(skill.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('skill.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(skill.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany()

    return { download_trend: downloadTrend, submit_trend: submitTrend }
  }

  // 导出统计
  async exportStats(type: string) {
    // 简化实现 - 返回JSON格式的CSV
    let data: any
    let filename: string

    switch (type) {
      case 'category':
        data = await this.getByCategory()
        filename = 'category_stats.csv'
        break
      case 'rating':
        data = await this.getByRating()
        filename = 'rating_stats.csv'
        break
      case 'download':
        data = await this.getByDownload()
        filename = 'download_stats.csv'
        break
      case 'project':
        data = await this.getByProject()
        filename = 'project_stats.csv'
        break
      default:
        data = await this.getOverview()
        filename = 'overview_stats.csv'
    }

    // 生成CSV
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0])
      const csvRows = [headers.join(',')]
      for (const row of data) {
        const values = headers.map(h => row[h] ?? '')
        csvRows.push(values.join(','))
      }
      const buffer = Buffer.from('\uFEFF' + csvRows.join('\n'), 'utf-8')
      return { buffer, filename }
    }

    // 对象格式
    const headers = Object.keys(data)
    const csvRows = [headers.join(','), headers.map(h => data[h] ?? '').join(',')]
    const buffer = Buffer.from('\uFEFF' + csvRows.join('\n'), 'utf-8')
    return { buffer, filename }
  }
}

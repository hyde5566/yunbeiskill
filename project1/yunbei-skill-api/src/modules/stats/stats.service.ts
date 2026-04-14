import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Skill } from '../skill/entities/skill.entity'
import { SkillVersion } from '../skill/entities/skill-version.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'
import { Rating } from '../rating/entities/rating.entity'
import { Feedback } from '../feedback/entities/feedback.entity'
import { SkillCategory } from '../skill-category/entities/skill-category.entity'
import { User } from '../user/entities/user.entity'
import { Project } from '../project/entities/project.entity'
import { SkillVisibility } from '../skill/entities/skill-visibility.entity'

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(SkillVersion)
    private versionRepo: Repository<SkillVersion>,
    @InjectRepository(DownloadRecord)
    private downloadRepo: Repository<DownloadRecord>,
    @InjectRepository(Rating)
    private ratingRepo: Repository<Rating>,
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
    @InjectRepository(SkillCategory)
    private categoryRepo: Repository<SkillCategory>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(SkillVisibility)
    private visibilityRepo: Repository<SkillVisibility>
  ) {}

  // 总览统计
  async getOverview() {
    const totalSkills = await this.skillRepo.count()
    const publishedSkills = await this.skillRepo.count({ where: { status: 'published' } })
    const pendingSkills = await this.skillRepo.count({ where: { status: 'pending_review' } })
    const totalDownloads = await this.downloadRepo.count()
    const totalUsers = await this.userRepo.count()
    const totalRatings = await this.ratingRepo.count()
    const totalFeedbacks = await this.feedbackRepo.count()

    // 本周新增
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyNewSkills = await this.skillRepo
      .createQueryBuilder('skill')
      .where('skill.createdAt >= :weekAgo', { weekAgo })
      .getCount()
    const weeklyDownloads = await this.downloadRepo
      .createQueryBuilder('download')
      .where('download.downloadedAt >= :weekAgo', { weekAgo })
      .getCount()

    return {
      totalSkills,
      publishedSkills,
      pendingSkills,
      totalDownloads,
      totalUsers,
      totalRatings,
      totalFeedbacks,
      weeklyNewSkills,
      weeklyDownloads
    }
  }

  // Skill状态统计
  async getSkillStats() {
    const statusCounts = await this.skillRepo
      .createQueryBuilder('skill')
      .select('skill.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('skill.status')
      .getRawMany()

    const sourceCounts = await this.skillRepo
      .createQueryBuilder('skill')
      .select('skill.sourceType', 'sourceType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('skill.sourceType')
      .getRawMany()

    return { statusCounts, sourceCounts }
  }

  // 下载统计（按时间）
  async getDownloadStats() {
    // 最近7天每日下载量
    const dailyDownloads: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await this.downloadRepo
        .createQueryBuilder('download')
        .where('download.downloadedAt >= :date', { date })
        .andWhere('download.downloadedAt < :nextDate', { nextDate })
        .getCount()

      dailyDownloads.push({
        date: date.toISOString().split('T')[0],
        count
      })
    }

    // 热门下载Skill TOP 10
    const topDownloads = await this.downloadRepo
      .createQueryBuilder('download')
      .leftJoin('download.skill', 'skill')
      .select('download.skillId', 'skillId')
      .addSelect('skill.name', 'skillName')
      .addSelect('COUNT(*)', 'downloadCount')
      .groupBy('download.skillId')
      .addGroupBy('skill.name')
      .orderBy('downloadCount', 'DESC')
      .limit(10)
      .getRawMany()

    return { dailyDownloads, topDownloads }
  }

  // 分类统计
  async getCategoryStats() {
    const categories = await this.categoryRepo.find()
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const skillCount = await this.skillRepo.count({ where: { categoryId: cat.id } })
        const avgRating = await this.ratingRepo
          .createQueryBuilder('rating')
          .innerJoin('rating.skill', 'skill')
          .where('skill.categoryId = :categoryId', { categoryId: cat.id })
          .select('AVG(rating.score)', 'avg')
          .getRawOne()

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          skillCount,
          avgRating: avgRating?.avg || 0
        }
      })
    )

    return categoryStats
  }

  // 项目维度统计
  async getProjectStats() {
    const projects = await this.projectRepo.find({ relations: ['members'] })
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        // 获取该项目可见的Skill数量
        const visibleSkills = await this.visibilityRepo
          .createQueryBuilder('visibility')
          .where('visibility.targetType = :type', { type: 'project' })
          .andWhere('visibility.targetId = :projectId', { projectId: project.id })
          .getMany()

        const skillIds = visibleSkills.map(v => v.skillId)

        // 该项目成员下载次数
        const memberIds = project.members?.map(m => m.id) || []
        let downloadCount = 0
        if (memberIds.length > 0) {
          downloadCount = await this.downloadRepo
            .createQueryBuilder('download')
            .where('download.userId IN (:...memberIds)', { memberIds })
            .getCount()
        }

        // 公开Skill也计入
        const publicSkills = await this.skillRepo
          .createQueryBuilder('skill')
          .where('skill.visibilityType = :type', { type: 'all' })
          .andWhere('skill.status = :status', { status: 'published' })
          .getMany()

        const totalVisibleSkillCount = skillIds.length + publicSkills.length

        return {
          projectId: project.id,
          projectName: project.name,
          visibleSkillCount: totalVisibleSkillCount,
          downloadCount,
          memberCount: memberIds.length,
          status: project.status
        }
      })
    )

    return projectStats
  }

  // 用户维度统计
  async getUserStats(params: { page?: number; pageSize?: number }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 20

    const users = await this.userRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['department']
    })

    const userStats = await Promise.all(
      users.map(async (user) => {
        // 提交的Skill数量
        const submittedCount = await this.skillRepo.count({ where: { submitterId: user.id } })

        // 下载次数
        const downloadCount = await this.downloadRepo.count({ where: { userId: user.id } })

        // 获得的评分平均分（提交的Skill）
        const avgRating = await this.ratingRepo
          .createQueryBuilder('rating')
          .innerJoin('rating.skill', 'skill')
          .where('skill.submitterId = :userId', { userId: user.id })
          .select('AVG(rating.score)', 'avg')
          .getRawOne()

        // 收到的反馈数量
        const feedbackCount = await this.feedbackRepo
          .createQueryBuilder('feedback')
          .innerJoin('feedback.skill', 'skill')
          .where('skill.submitterId = :userId', { userId: user.id })
          .getCount()

        // 已发布的Skill数量
        const publishedCount = await this.skillRepo.count({
          where: { submitterId: user.id, status: 'published' }
        })

        return {
          userId: user.id,
          username: user.username,
          realName: user.realName,
          department: user.department?.name || '-',
          submittedCount,
          publishedCount,
          downloadCount,
          avgRating: avgRating?.avg ? parseFloat(avgRating.avg) : 0,
          feedbackCount
        }
      })
    )

    const total = await this.userRepo.count()

    return { list: userStats, total, page, pageSize }
  }

  // CSV导出方法
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  async exportSkillsCsv(): Promise<string> {
    const skills = await this.skillRepo.find({
      relations: ['category', 'submitter'],
      order: { createdAt: 'DESC' }
    })

    const headers = ['ID', '名称', '描述', '分类', '来源类型', '来源名称', '状态', '提交人', '创建时间']
    const rows = skills.map(s => [
      this.escapeCSV(s.id),
      this.escapeCSV(s.name),
      this.escapeCSV(s.description),
      this.escapeCSV(s.category?.name),
      this.escapeCSV(s.sourceType),
      this.escapeCSV(s.sourceName),
      this.escapeCSV(s.status),
      this.escapeCSV(s.submitter?.realName),
      this.escapeCSV(s.createdAt?.toISOString?.() || s.createdAt)
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  async exportDownloadsCsv(): Promise<string> {
    const downloads = await this.downloadRepo.find({
      relations: ['skill', 'user', 'version', 'department'],
      order: { downloadedAt: 'DESC' }
    })

    const headers = ['ID', '用户', '部门', 'Skill名称', '版本', '下载时间']
    const rows = downloads.map(d => [
      this.escapeCSV(d.id),
      this.escapeCSV(d.user?.realName),
      this.escapeCSV(d.department?.name),
      this.escapeCSV(d.skill?.name),
      this.escapeCSV(d.version?.versionNumber),
      this.escapeCSV(d.downloadedAt?.toISOString?.() || d.downloadedAt)
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  async exportUsersCsv(): Promise<string> {
    const userStats = await this.getUserStats({ page: 1, pageSize: 1000 })

    const headers = ['用户ID', '用户名', '姓名', '部门', '提交数量', '已发布数量', '下载次数', '平均评分', '反馈数量']
    const rows = userStats.list.map(u => [
      this.escapeCSV(u.userId),
      this.escapeCSV(u.username),
      this.escapeCSV(u.realName),
      this.escapeCSV(u.department),
      this.escapeCSV(u.submittedCount),
      this.escapeCSV(u.publishedCount),
      this.escapeCSV(u.downloadCount),
      this.escapeCSV(u.avgRating),
      this.escapeCSV(u.feedbackCount)
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  async exportCategoriesCsv(): Promise<string> {
    const categoryStats = await this.getCategoryStats()

    const headers = ['分类ID', '分类名称', 'Skill数量', '平均评分']
    const rows = categoryStats.map(c => [
      this.escapeCSV(c.categoryId),
      this.escapeCSV(c.categoryName),
      this.escapeCSV(c.skillCount),
      this.escapeCSV(c.avgRating)
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }
}
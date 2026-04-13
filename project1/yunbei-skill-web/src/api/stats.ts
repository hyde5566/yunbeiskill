import request from './request'

export interface OverviewStats {
  totalSkills: number
  publishedSkills: number
  pendingSkills: number
  totalDownloads: number
  totalUsers: number
  totalRatings: number
  totalFeedbacks: number
  weeklyNewSkills: number
  weeklyDownloads: number
}

export interface SkillStats {
  statusCounts: { status: string; count: string }[]
  sourceCounts: { sourceType: string; count: string }[]
}

export interface DownloadStats {
  dailyDownloads: { date: string; count: number }[]
  topDownloads: { skillId: string; skillName: string; downloadCount: string }[]
}

export interface CategoryStats {
  categoryId: number
  categoryName: string
  skillCount: number
  avgRating: number
}

// 获取总览统计
export function getOverviewStats(): Promise<OverviewStats> {
  return request.get('/stats/overview')
}

// 获取Skill统计
export function getSkillStats(): Promise<SkillStats> {
  return request.get('/stats/skills')
}

// 获取下载统计
export function getDownloadStats(): Promise<DownloadStats> {
  return request.get('/stats/downloads')
}

// 获取分类统计
export function getCategoryStats(): Promise<CategoryStats[]> {
  return request.get('/stats/categories')
}

export interface ProjectStats {
  projectId: number
  projectName: string
  visibleSkillCount: number
  downloadCount: number
  memberCount: number
  status: string
}

export interface UserStats {
  userId: number
  username: string
  realName: string
  department: string
  submittedCount: number
  publishedCount: number
  downloadCount: number
  avgRating: number
  feedbackCount: number
}

export interface UserStatsResult {
  list: UserStats[]
  total: number
  page: number
  pageSize: number
}

// 获取项目统计
export function getProjectStats(): Promise<ProjectStats[]> {
  return request.get('/stats/projects')
}

// 获取用户统计
export function getUserStats(page: number = 1, pageSize: number = 20): Promise<UserStatsResult> {
  return request.get('/stats/users', { params: { page, pageSize } })
}

// 导出接口
export function getExportUrl(type: 'skills' | 'downloads' | 'users' | 'categories'): string {
  return `/api/stats/export/${type}`
}
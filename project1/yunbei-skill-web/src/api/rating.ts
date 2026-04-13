import request from './request'

export interface Rating {
  id: number
  userId: number
  skillId: number
  versionId: number | null
  score: number
  createdAt: string
}

export interface RatingStats {
  average: number
  total: number
  distribution: Record<number, number>
}

// 创建/更新评分
export function createRating(skillId: number, score: number, versionId?: number): Promise<Rating> {
  return request.post('/ratings', { skillId, score, versionId })
}

// 获取我的评分
export function getMyRating(skillId: number): Promise<Rating | null> {
  return request.get(`/ratings/my/${skillId}`)
}

// 获取评分统计
export function getRatingStats(skillId: number): Promise<RatingStats> {
  return request.get(`/ratings/stats/${skillId}`)
}
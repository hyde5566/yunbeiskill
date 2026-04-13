import request from './request'

export interface Feedback {
  id: number
  userId: number
  skillId: number
  versionId: number | null
  content: string
  user?: {
    id: number
    realName: string
  }
  createdAt: string
}

export interface FeedbackListResult {
  list: Feedback[]
  total: number
  page: number
  pageSize: number
}

// 创建反馈
export function createFeedback(skillId: number, content: string, versionId?: number): Promise<Feedback> {
  return request.post('/feedbacks', { skillId, content, versionId })
}

// 获取Skill反馈列表
export function getSkillFeedbacks(skillId: number, page?: number, pageSize?: number): Promise<FeedbackListResult> {
  return request.get(`/feedbacks/skill/${skillId}`, { params: { page, pageSize } })
}

// 获取我的反馈
export function getMyFeedbacks(page?: number, pageSize?: number): Promise<FeedbackListResult> {
  return request.get('/feedbacks/my', { params: { page, pageSize } })
}
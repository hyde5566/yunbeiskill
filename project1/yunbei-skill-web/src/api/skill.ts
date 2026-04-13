import request from './request'

export interface Skill {
  id: number
  uniqueId: string
  name: string
  description: string | null
  detailDescription: string | null
  author: string | null
  categoryId: number
  category?: {
    id: number
    name: string
  }
  sourceType: 'internal' | 'external'
  sourceName: string | null
  submitterId: number
  submitter?: {
    id: number
    realName: string
  }
  status: string
  visibilityType: 'all' | 'project' | 'account'
  visibilitySettings?: {
    id: number
    targetType: 'project' | 'account'
    targetId: number
  }[]
  versions?: SkillVersion[]
  createdAt: string
  updatedAt: string
}

export interface SkillVersion {
  id: number
  skillId: number
  versionNumber: string
  zipPath: string
  zipSize: number
  changeLog: string | null
  uploaderId: number
  status: string
  createdAt: string
}

export interface CreateSkillParams {
  name: string
  description?: string | null
  categoryId: number
  sourceType: 'internal' | 'external'
  sourceName?: string
  visibilityType: 'all' | 'project' | 'account'
  visibilityTargets?: number[]
}

export interface UpdateSkillParams {
  name?: string
  description?: string | null
  detailDescription?: string | null
  author?: string | null
  categoryId?: number
  sourceType?: 'internal' | 'external'
  sourceName?: string | null
  visibilityType?: 'all' | 'project' | 'account'
  visibilityTargets?: number[]
}

export interface SkillListParams {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
  sourceType?: string
  status?: string
}

export interface SkillListResult {
  list: Skill[]
  total: number
  page: number
  pageSize: number
}

export interface CreateVersionParams {
  versionNumber: string
  zipPath: string
  zipSize: number
  changeLog?: string | null
}

// 获取Skill列表
export function getSkillList(params: SkillListParams): Promise<SkillListResult> {
  return request.get('/skills', { params })
}

// 获取我提交的Skill列表
export function getMySkills(): Promise<Skill[]> {
  return request.get('/skills/my')
}

// 获取Skill详情
export function getSkill(id: number): Promise<Skill> {
  return request.get(`/skills/${id}`)
}

// 创建Skill
export function createSkill(data: CreateSkillParams): Promise<Skill> {
  return request.post('/skills', data)
}

// 更新Skill
export function updateSkill(id: number, data: UpdateSkillParams): Promise<Skill> {
  return request.put(`/skills/${id}`, data)
}

// 删除Skill
export function deleteSkill(id: number): Promise<void> {
  return request.delete(`/skills/${id}`)
}

// 获取版本列表
export function getSkillVersions(id: number): Promise<SkillVersion[]> {
  return request.get(`/skills/${id}/versions`)
}

// 添加新版本
export function addSkillVersion(id: number, data: CreateVersionParams): Promise<SkillVersion> {
  return request.post(`/skills/${id}/versions`, data)
}

// 审核通过
export function approveSkill(id: number): Promise<Skill> {
  return request.post(`/skills/${id}/approve`)
}

// 审核驳回
export function rejectSkill(id: number, reason: string): Promise<Skill> {
  return request.post(`/skills/${id}/reject`, { reason })
}

// 发布Skill
export function publishSkill(id: number): Promise<Skill> {
  return request.post(`/skills/${id}/publish`)
}

// 下架Skill
export function unpublishSkill(id: number): Promise<Skill> {
  return request.post(`/skills/${id}/unpublish`)
}

// 修改并重新提交（用户）
export function resubmitSkill(id: number, data: UpdateSkillParams): Promise<Skill> {
  return request.put(`/skills/${id}/resubmit`, data)
}

// 获取待审核版本列表
export function getPendingVersions(page: number = 1, pageSize: number = 20): Promise<{ list: SkillVersion[]; total: number; page: number; pageSize: number }> {
  return request.get('/skills/pending-version-review', { params: { page, pageSize } })
}

// 审核通过版本
export function approveVersion(skillId: number, versionId: number): Promise<SkillVersion> {
  return request.post(`/skills/${skillId}/versions/${versionId}/approve`)
}

// 审核驳回版本
export function rejectVersion(skillId: number, versionId: number, reason: string): Promise<SkillVersion> {
  return request.post(`/skills/${skillId}/versions/${versionId}/reject`, { reason })
}
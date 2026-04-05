import request from '../utils/request'

export interface Skill {
  id: number
  skillName: string
  skillCode: string
  categoryId: number
  categoryName: string
  description: string
  inputExample: string
  outputExample: string
  author: string
  version: string
  status: number
  viewCount: number
  useCount: number
  createTime: string
  tags: string[]
  // 新增字段
  type: number
  deptId: number
  deptName: string
  sourceType: number
  sourceDesc: string
  sourceLink: string
  tutorialUrl: string
  filePath: string
  screenshots: string[]
  visibility: number
  needAuth: number
  authApproverId: number
  isFeatured: number
  downloadCount: number
  avgRating: number
  rejectReason: string
  projectIds: number[]
}

export interface SkillDTO {
  id?: number
  skillName: string
  skillCode: string
  categoryId: number
  description?: string
  inputExample?: string
  outputExample?: string
  author?: string
  version?: string
  status?: number
  // 新增字段
  type?: number
  deptId?: number
  sourceType?: number
  sourceDesc?: string
  sourceLink?: string
  tutorialUrl?: string
  filePath?: string
  screenshots?: string[]
  visibility?: number
  needAuth?: number
  authApproverId?: number
  projectIds?: number[]
}

export function getSkillList(params: { page: number; pageSize: number; keyword?: string; categoryId?: number; status?: number; type?: number }) {
  return request.get<any, { data: { records: Skill[]; total: number } }>('/skill/list', { params })
}

export function getSkillById(id: number) {
  return request.get<any, { data: Skill }>(`/skill/${id}`)
}

export function createSkill(data: SkillDTO) {
  return request.post<any, { data: number }>('/skill', data)
}

export function updateSkill(data: SkillDTO) {
  return request.put('/skill', data)
}

export function deleteSkill(id: number) {
  return request.delete(`/skill/${id}`)
}

export function updateSkillTags(id: number, tags: string[]) {
  return request.post(`/skill/${id}/tags`, tags)
}

export function approveSkill(id: number) {
  return request.post(`/skill/${id}/approve`)
}

export function rejectSkill(id: number, reason: string) {
  return request.post(`/skill/${id}/reject`, { reason })
}

export function offlineSkill(id: number, reason: string) {
  return request.post(`/skill/${id}/offline`, { reason })
}

export function downloadSkill(id: number) {
  return request.post(`/skill/${id}/download`)
}
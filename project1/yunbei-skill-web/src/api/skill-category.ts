import request from './request'

export interface SkillCategory {
  id: number
  name: string
  description: string | null
  sortOrder: number
  createdAt: string
}

export interface CreateCategoryParams {
  name: string
  description?: string | null
  sortOrder?: number
}

export interface UpdateCategoryParams {
  name?: string
  description?: string | null
  sortOrder?: number
}

// 获取分类列表
export function getCategoryList(): Promise<SkillCategory[]> {
  return request.get('/skill-categories')
}

// 获取分类详情
export function getCategory(id: number): Promise<SkillCategory> {
  return request.get(`/skill-categories/${id}`)
}

// 创建分类
export function createCategory(data: CreateCategoryParams): Promise<SkillCategory> {
  return request.post('/skill-categories', data)
}

// 更新分类
export function updateCategory(id: number, data: UpdateCategoryParams): Promise<SkillCategory> {
  return request.put(`/skill-categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id: number): Promise<void> {
  return request.delete(`/skill-categories/${id}`)
}
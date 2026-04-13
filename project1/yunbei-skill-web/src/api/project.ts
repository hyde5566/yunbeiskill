import request from './request'

export interface Project {
  id: number
  name: string
  description: string | null
  ownerId: number | null
  status: string
  createdAt: string
  updatedAt: string
  members?: {
    id: number
    realName: string
    username: string
  }[]
}

export interface CreateProjectParams {
  name: string
  description?: string | null
  memberIds?: number[]
}

export interface UpdateProjectParams {
  name?: string
  description?: string | null
  memberIds?: number[]
}

// 获取项目列表
export function getProjectList(): Promise<Project[]> {
  return request.get('/projects')
}

// 获取项目详情
export function getProject(id: number): Promise<Project> {
  return request.get(`/projects/${id}`)
}

// 创建项目
export function createProject(data: CreateProjectParams): Promise<Project> {
  return request.post('/projects', data)
}

// 更新项目
export function updateProject(id: number, data: UpdateProjectParams): Promise<Project> {
  return request.put(`/projects/${id}`, data)
}

// 删除项目
export function deleteProject(id: number): Promise<void> {
  return request.delete(`/projects/${id}`)
}

// 获取项目成员
export function getProjectMembers(id: number): Promise<any[]> {
  return request.get(`/projects/${id}/members`)
}

// 添加项目成员
export function addProjectMembers(id: number, userIds: number[]): Promise<Project> {
  return request.post(`/projects/${id}/members`, { userIds })
}

// 移除项目成员
export function removeProjectMember(id: number, userId: number): Promise<Project> {
  return request.delete(`/projects/${id}/members/${userId}`)
}
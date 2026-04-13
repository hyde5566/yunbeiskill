import request from './request'

export interface User {
  id: number
  username: string
  realName: string
  departmentId: number
  email?: string
  phone?: string
  status: number
  createdAt: string
  updatedAt: string
  department?: Department
}

export interface Department {
  id: number
  name: string
  parentId: number | null
  level: number
  sortOrder: number
}

export interface UserListParams {
  page?: number
  pageSize?: number
  departmentId?: number
  status?: number
  keyword?: string
}

export interface UserListResult {
  list: User[]
  total: number
  page: number
  pageSize: number
}

// 获取用户列表
export function getUserList(params: UserListParams): Promise<UserListResult> {
  return request.get('/users', { params })
}

// 获取用户详情
export function getUserDetail(id: number): Promise<User> {
  return request.get(`/users/${id}`)
}

// 创建用户
export function createUser(data: Partial<User> & { password: string }): Promise<User> {
  return request.post('/users', data)
}

// 更新用户
export function updateUser(id: number, data: Partial<User>): Promise<User> {
  return request.put(`/users/${id}`, data)
}

// 删除用户
export function deleteUser(id: number): Promise<void> {
  return request.delete(`/users/${id}`)
}
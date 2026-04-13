import request from './request'

export interface Department {
  id: number
  name: string
  parentId: number | null
  level: number
  sortOrder: number
  createdAt: string
  updatedAt: string
  children?: Department[]
}

export interface DeptTreeResult {
  id: number
  name: string
  parentId: number | null
  level: number
  sortOrder: number
  createdAt: string
  children: DeptTreeResult[]
}

// 获取部门列表
export function getDeptList(): Promise<Department[]> {
  return request.get('/departments')
}

// 获取部门树形结构
export function getDeptTree(): Promise<DeptTreeResult[]> {
  return request.get('/departments/tree')
}

// 创建部门
export function createDept(data: Partial<Department>): Promise<Department> {
  return request.post('/departments', data)
}

// 更新部门
export function updateDept(id: number, data: Partial<Department>): Promise<Department> {
  return request.put(`/departments/${id}`, data)
}

// 删除部门
export function deleteDept(id: number): Promise<void> {
  return request.delete(`/departments/${id}`)
}
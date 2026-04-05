import request from '../utils/request'

export interface Role {
  id: number
  roleName: string
  roleCode: string
  description: string
  status: number
  createTime: string
}

export interface RoleDTO {
  id?: number
  roleName: string
  roleCode: string
  description: string
  status: number
  permissionIds?: number[]
}

export function getRoleList(params: { page: number; pageSize: number; keyword?: string }) {
  return request.get<any, { data: { records: Role[]; total: number } }>('/role/list', { params })
}

export function getAllRoles() {
  return request.get<any, { data: Role[] }>('/role/all')
}

export function getRoleById(id: number) {
  return request.get<any, { data: Role }>(`/role/${id}`)
}

export function getRolePermissions(id: number) {
  return request.get<any, { data: number[] }>(`/role/${id}/permissions`)
}

export function createRole(data: RoleDTO) {
  return request.post('/role', data)
}

export function updateRole(data: RoleDTO) {
  return request.put('/role', data)
}

export function deleteRole(id: number) {
  return request.delete(`/role/${id}`)
}

export function assignRolePermissions(id: number, permissionIds: number[]) {
  return request.post(`/role/${id}/permissions`, permissionIds)
}
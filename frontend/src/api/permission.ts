import request from '../utils/request'

export interface Permission {
  id: number
  permissionName: string
  permissionCode: string
  description: string
  resourceType: string
  parentId: number
  resourcePath: string
  sortOrder: number
  status: number
}

export interface PermissionDTO {
  id?: number
  permissionName: string
  permissionCode: string
  description?: string
  resourceType: string
  parentId?: number
  resourcePath?: string
  sortOrder?: number
  status: number
}

export function getPermissionList() {
  return request.get<any, { data: Permission[] }>('/permission/list')
}

export function getPermissionTree() {
  return request.get<any, { data: Permission[] }>('/permission/tree')
}

export function getPermissionById(id: number) {
  return request.get<any, { data: Permission }>(`/permission/${id}`)
}

export function createPermission(data: PermissionDTO) {
  return request.post('/permission', data)
}

export function updatePermission(data: PermissionDTO) {
  return request.put('/permission', data)
}

export function deletePermission(id: number) {
  return request.delete(`/permission/${id}`)
}
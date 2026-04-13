import request from './request'

export interface Permission {
  id: number
  code: string
  name: string
  description: string
}

export interface AssignPermissionsParams {
  userId: number
  permissionIds: number[]
}

// 获取所有权限列表
export function getPermissionList(): Promise<Permission[]> {
  return request.get('/permissions')
}

// 获取用户权限
export function getUserPermissions(userId: number): Promise<Permission[]> {
  return request.get(`/permissions/user/${userId}`)
}

// 分配权限给用户
export function assignPermissions(data: AssignPermissionsParams): Promise<void> {
  return request.post('/permissions/assign', data)
}
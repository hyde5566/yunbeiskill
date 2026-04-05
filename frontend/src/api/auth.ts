import request from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  avatar: string
  token: string
  permissions: string[]
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export function login(data: LoginParams) {
  return request.post<any, { data: UserInfo }>('/auth/login', data)
}

export function logout() {
  return request.post('/auth/logout')
}

export function getCurrentUser() {
  return request.get<any, { data: UserInfo }>('/auth/current')
}

export function changePassword(data: ChangePasswordParams) {
  return request.post('/auth/change-password', data)
}

export function getUserPermissions() {
  return request.get<any, { data: string[] }>('/auth/permissions')
}
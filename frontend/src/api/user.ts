import request from '../utils/request'

export interface User {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  avatar: string
  status: number
  createTime: string
  roleNames: string[]
}

export interface UserDTO {
  id?: number
  username: string
  password?: string
  realName: string
  phone: string
  email: string
  avatar?: string
  status: number
  roleIds?: number[]
}

export function getUserList(params: { page: number; pageSize: number; keyword?: string }) {
  return request.get<any, { data: { records: User[]; total: number } }>('/user/list', { params })
}

export function getUserById(id: number) {
  return request.get<any, { data: User }>(`/user/${id}`)
}

export function getUserRoles(id: number) {
  return request.get<any, { data: number[] }>(`/user/${id}/roles`)
}

export function createUser(data: UserDTO) {
  return request.post('/user', data)
}

export function updateUser(data: UserDTO) {
  return request.put('/user', data)
}

export function deleteUser(id: number) {
  return request.delete(`/user/${id}`)
}

export function assignUserRoles(id: number, roleIds: number[]) {
  return request.post(`/user/${id}/roles`, roleIds)
}
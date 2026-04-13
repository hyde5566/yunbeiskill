import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: {
    id: number | string
    username: string
    realName: string
    departmentId: number | string
    permissions: string[]
  }
}

export interface UserInfo {
  id: number | string
  username: string
  realName: string
  departmentId: number | string
  email?: string
  phone?: string
  permissions: string[]
}

// 登录
export function login(data: LoginParams): Promise<LoginResult> {
  return request.post('/auth/login', data)
}

// 获取当前用户信息
export function getUserInfo(): Promise<UserInfo> {
  return request.get('/auth/me')
}
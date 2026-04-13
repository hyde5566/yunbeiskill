import request from './request'

export interface LoginLog {
  id: number
  userId: number
  username: string
  loginType: 'login' | 'logout'
  ipAddress: string | null
  device: string | null
  status: number
  createdAt: string
}

export interface LoginLogListResult {
  list: LoginLog[]
  total: number
  page: number
  pageSize: number
}

// 获取登录日志列表
export function getLoginLogs(params?: {
  userId?: number
  username?: string
  loginType?: string
  status?: number
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<LoginLogListResult> {
  return request.get('/login-logs', { params })
}
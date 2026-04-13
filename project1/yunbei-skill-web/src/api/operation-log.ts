import request from './request'

export interface OperationLog {
  id: number
  userId: number
  user?: { realName: string }
  module: string
  action: string
  targetType: string | null
  targetId: number | null
  detail: string | null
  ipAddress: string | null
  createdAt: string
}

export interface OperationLogListResult {
  list: OperationLog[]
  total: number
  page: number
  pageSize: number
}

// 获取操作日志列表
export function getOperationLogs(params?: {
  userId?: number
  module?: string
  action?: string
  targetType?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<OperationLogListResult> {
  return request.get('/operation-logs', { params })
}
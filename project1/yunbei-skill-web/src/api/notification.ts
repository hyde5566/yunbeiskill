import request from './request'

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string | null
  relatedSkillId: number | null
  relatedVersionId: number | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListResult {
  list: Notification[]
  total: number
  page: number
  pageSize: number
}

// 获取通知列表
export function getNotifications(page?: number, pageSize?: number): Promise<NotificationListResult> {
  return request.get('/notifications', { params: { page, pageSize } })
}

// 获取未读数量
export function getUnreadCount(): Promise<{ count: number }> {
  return request.get('/notifications/unread-count')
}

// 标记已读
export function markAsRead(id: number): Promise<{ success: boolean }> {
  return request.post(`/notifications/${id}/read`)
}

// 标记全部已读
export function markAllAsRead(): Promise<{ success: boolean }> {
  return request.post('/notifications/read-all')
}
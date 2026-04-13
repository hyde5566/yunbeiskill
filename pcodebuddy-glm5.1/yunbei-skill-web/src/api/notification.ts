import request from './request'

export const getNotifications = (params?: any) => request.get('/notifications', { params })
export const getUnreadCount = () => request.get('/notifications/unread-count')
export const markAsRead = (id: number) => request.put(`/notifications/${id}/read`)
export const markAllAsRead = () => request.put('/notifications/read-all')
export const deleteNotification = (id: number) => request.delete(`/notifications/${id}`)

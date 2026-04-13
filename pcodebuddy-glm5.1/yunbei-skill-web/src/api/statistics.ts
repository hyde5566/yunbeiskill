import request from './request'

export const getOverviewStats = () => request.get('/statistics/overview')
export const getDashboardStats = () => request.get('/statistics/dashboard')
export const getCategoryStats = () => request.get('/statistics/by-category')
export const getTopDownloads = (params?: any) => request.get('/statistics/top-downloads', { params })
export const getRatingDistribution = () => request.get('/statistics/rating-distribution')
export const getDownloadTrend = (params?: any) => request.get('/statistics/download-trend', { params })
export const getRatingStats = () => request.get('/statistics/by-rating')
export const getDownloadStats = (params?: any) => request.get('/statistics/by-download', { params })
export const getProjectStats = () => request.get('/statistics/by-project')
export const getUserStats = () => request.get('/statistics/by-user')
export const getTimelineStats = (params?: any) => request.get('/statistics/timeline', { params })
export const exportStats = (type: string) => request.get(`/statistics/export/${type}`, { responseType: 'blob' })

import request from './request'

export const submitRating = (data: any) => request.post('/ratings', data)
export const getSkillRatings = (skillId: number, params?: any) => request.get(`/ratings/skill/${skillId}`, { params })
export const getMyRatings = (params?: any) => request.get('/ratings/my', { params })

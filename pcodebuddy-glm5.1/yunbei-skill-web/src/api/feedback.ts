import request from './request'

export const submitFeedback = (data: any) => request.post('/feedbacks', data)
export const getSkillFeedbacks = (skillId: number, params?: any) =>
  request.get(`/feedbacks/skill/${skillId}`, { params })
export const getMyFeedbacks = (params?: any) => request.get('/feedbacks/my', { params })
export const markFeedbackInvalid = (id: number, data?: any) =>
  request.put(`/feedbacks/${id}/invalid`, data || { is_invalid: 1 })
export const getAllFeedbacks = (params?: any) => request.get('/feedbacks/all', { params })

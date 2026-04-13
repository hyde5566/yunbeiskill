import request from './request'

export const getPendingReviews = (params?: any) => request.get('/reviews/pending', { params })
export const getReviewHistory = (params?: any) => request.get('/reviews/all', { params })
export const getReviewDetail = (id: number) => request.get(`/reviews/${id}`)
export const approveReview = (id: number, data: any) => request.post(`/reviews/${id}/action`, { status: 'approved', ...data })
export const rejectReview = (id: number, data: any) => request.post(`/reviews/${id}/action`, { status: 'rejected', ...data })
export const assignReviewer = (data: { skill_id: number; version_id: number; reviewer_id: number }) =>
  request.post('/reviews/assign', data)

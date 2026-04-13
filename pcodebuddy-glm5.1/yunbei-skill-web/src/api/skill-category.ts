import request from './request'

export const getCategoryList = () => request.get('/skill-categories')
export const getSkillCategories = getCategoryList
export const getCategoryDetail = (id: number) => request.get(`/skill-categories/${id}`)
export const createCategory = (data: any) => request.post('/skill-categories', data)
export const updateCategory = (id: number, data: any) => request.put(`/skill-categories/${id}`, data)
export const deleteCategory = (id: number) => request.delete(`/skill-categories/${id}`)

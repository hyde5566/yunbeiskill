import request from '../utils/request'

export interface Category {
  id: number
  categoryName: string
  categoryCode: string
  parentId: number
  description: string
  sortOrder: number
  status: number
}

export interface CategoryDTO {
  id?: number
  categoryName: string
  categoryCode: string
  parentId?: number
  description?: string
  sortOrder?: number
  status: number
}

export function getCategoryList() {
  return request.get<any, { data: Category[] }>('/category/list')
}

export function getCategoryById(id: number) {
  return request.get<any, { data: Category }>(`/category/${id}`)
}

export function createCategory(data: CategoryDTO) {
  return request.post('/category', data)
}

export function updateCategory(data: CategoryDTO) {
  return request.put('/category', data)
}

export function deleteCategory(id: number) {
  return request.delete(`/category/${id}`)
}
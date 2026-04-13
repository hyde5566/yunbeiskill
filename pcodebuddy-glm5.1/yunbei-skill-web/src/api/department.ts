import request from './request'

export function getDepartments() {
  return request.get('/departments')
}

export function getDepartmentTree() {
  return request.get('/departments/tree')
}

export function createDepartment(data: any) {
  return request.post('/departments', data)
}

export function updateDepartment(id: number, data: any) {
  return request.put(`/departments/${id}`, data)
}

export function deleteDepartment(id: number) {
  return request.delete(`/departments/${id}`)
}

export function getDepartmentMembers(id: number) {
  return request.get(`/departments/${id}/members`)
}

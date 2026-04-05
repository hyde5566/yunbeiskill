import request from '../utils/request'

export interface Organization {
  id: number
  orgName: string
  orgCode: string
  parentId: number
  orgType: number
  leader: string
  phone: string
  sortOrder: number
  status: number
}

export interface OrganizationDTO {
  id?: number
  orgName: string
  orgCode: string
  parentId?: number
  orgType?: number
  leader?: string
  phone?: string
  sortOrder?: number
  status: number
}

export function getOrgList() {
  return request.get<any, { data: Organization[] }>('/org/list')
}

export function getOrgTree() {
  return request.get<any, { data: Organization[] }>('/org/tree')
}

export function getOrgById(id: number) {
  return request.get<any, { data: Organization }>(`/org/${id}`)
}

export function createOrg(data: OrganizationDTO) {
  return request.post('/org', data)
}

export function updateOrg(data: OrganizationDTO) {
  return request.put('/org', data)
}

export function deleteOrg(id: number) {
  return request.delete(`/org/${id}`)
}
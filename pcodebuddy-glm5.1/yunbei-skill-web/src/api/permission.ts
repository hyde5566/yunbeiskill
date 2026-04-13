import request from './request'

export const getPermissions = () => request.get('/permissions')
export const getUserPermissions = (userId: number) => request.get(`/permissions/user/${userId}`)
export const assignPermissions = (data: { user_id: number; permission_codes: string[] }) =>
  request.post('/permissions/assign', data)

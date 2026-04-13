import request from './request'

export const getOperationLogs = (params?: any) => request.get('/operation-logs', { params })
export const getLoginLogs = (params?: any) => request.get('/login-logs', { params })

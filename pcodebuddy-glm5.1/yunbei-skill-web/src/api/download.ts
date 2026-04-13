import request from './request'

export const getMyDownloads = (params?: any) => request.get('/downloads/my/skills', { params })
export const getMyDownloadRecords = (params?: any) => request.get('/downloads/my/records', { params })
export const downloadSkill = (skillId: number, versionId: number) =>
  request.get(`/skills/${skillId}/versions/${versionId}/download`, { responseType: 'blob' })

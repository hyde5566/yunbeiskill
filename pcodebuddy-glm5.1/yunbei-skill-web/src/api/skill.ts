import request from './request'

// Skill入库管理
export const submitSkill = (data: any) => request.post('/skills', data)
export const updateSkill = (id: number, data: any) => request.put(`/skills/${id}`, data)
export const getSkillDetail = (id: number) => request.get(`/skills/${id}`)

// Skill检索中心
export const searchSkills = (params?: any) => request.get('/skills', { params })

// 我的提交
export const getMySkills = (params?: any) => request.get('/skills/my-submissions', { params })

// Skill版本管理
export const submitVersion = (skillId: number, data: any) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('versionNumber', data.versionNumber)
  formData.append('changeLog', data.changeLog || '')
  return request.post(`/skills/${skillId}/versions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const getSkillVersions = (skillId: number) => request.get(`/skills/${skillId}/versions`)
export const downloadVersion = (skillId: number, versionId: number) =>
  request.get(`/skills/${skillId}/versions/${versionId}/download`, { responseType: 'blob' })

// Skill发布/下架（后端用POST）
export const publishSkill = (id: number) => request.post(`/skills/${id}/publish`)
export const unpublishSkill = (id: number) => request.post(`/skills/${id}/offline`)

// Skill下载
export const downloadSkill = (skillId: number, versionId: number) =>
  request.get(`/skills/${skillId}/versions/${versionId}/download`, { responseType: 'blob' })

// 管理员：获取所有Skill
export const getAllSkills = (params?: any) => request.get('/skills/all', { params })

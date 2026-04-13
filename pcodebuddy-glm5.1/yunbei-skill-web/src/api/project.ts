import request from './request'

// 项目管理
export const getProjects = (params?: any) => request.get('/projects', { params })
export const getProjectList = getProjects
export const getProjectDetail = (id: number) => request.get(`/projects/${id}`)
export const createProject = (data: any) => request.post('/projects', data)
export const updateProject = (id: number, data: any) => request.put(`/projects/${id}`, data)
export const deleteProject = (id: number) => request.delete(`/projects/${id}`)

// 项目成员
export const getProjectMembers = (projectId: number) => request.get(`/projects/${projectId}/members`)
export const addProjectMembers = (projectId: number, data: any) =>
  request.post(`/projects/${projectId}/members`, data)
export const removeProjectMember = (projectId: number, userId: number) =>
  request.delete(`/projects/${projectId}/members/${userId}`)

// 项目关联Skill
export const getProjectSkills = (projectId: number) => request.get(`/projects/${projectId}/skills`)
export const addProjectSkills = (projectId: number, data: any) =>
  request.post(`/projects/${projectId}/skills`, data)
export const removeProjectSkill = (projectId: number, skillId: number) =>
  request.delete(`/projects/${projectId}/skills/${skillId}`)

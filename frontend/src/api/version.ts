import request from '../utils/request'

export interface SkillVersion {
  id: number
  skillId: number
  version: string
  changeLog: string
  content: string
  createBy: number
  createTime: string
}

export interface VersionDTO {
  id?: number
  skillId: number
  version: string
  changeLog: string
  content?: string
}

export function getVersionList(skillId: number) {
  return request.get<any, { data: SkillVersion[] }>(`/version/skill/${skillId}`)
}

export function getVersionById(id: number) {
  return request.get<any, { data: SkillVersion }>(`/version/${id}`)
}

export function createVersion(data: VersionDTO) {
  return request.post('/version', data)
}

export function deleteVersion(id: number) {
  return request.delete(`/version/${id}`)
}

export function rollbackVersion(skillId: number, versionId: number) {
  return request.post(`/version/rollback/${skillId}/${versionId}`)
}
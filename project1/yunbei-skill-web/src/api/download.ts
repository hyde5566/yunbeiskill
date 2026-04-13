import request from './request'

export interface DownloadRecord {
  id: number
  userId: number
  skillId: number
  versionId: number
  skill?: {
    id: number
    name: string
    author?: string
    category?: { name: string }
  }
  version?: {
    id: number
    versionNumber: string
  }
  downloadedAt: string
}

export interface DownloadResult {
  downloadUrl: string
  zipPath: string
}

export interface DownloadListResult {
  list: DownloadRecord[]
  total: number
  page: number
  pageSize: number
}

export interface DownloadStats {
  total: number
  recentWeek: number
}

// 记录下载
export function createDownload(skillId: number, versionId: number): Promise<DownloadResult> {
  return request.post('/downloads', { skillId, versionId })
}

// 获取我的下载历史
export function getMyDownloads(page?: number, pageSize?: number): Promise<DownloadListResult> {
  return request.get('/downloads/my', { params: { page, pageSize } })
}

// 获取下载统计
export function getDownloadStats(skillId: number): Promise<DownloadStats> {
  return request.get(`/downloads/stats/${skillId}`)
}
import type { SkillStatus, SkillSourceType, VisibilityType } from './common'

export interface SkillCategory {
  id: number
  name: string
  description: string
  icon: string
  sort: number
}

export interface Skill {
  id: number
  name: string
  summary: string
  detail: string
  author: string
  categoryId: number
  categoryName?: string
  sourceType: SkillSourceType
  sourceUrl?: string
  sourceUrlName?: string
  visibilityType: VisibilityType
  status: SkillStatus
  submitterId: number
  submitterName?: string
  currentVersion?: string
  avgRating?: number
  ratingCount?: number
  downloadCount?: number
  projectId?: number
  projectName?: string
  createdAt: string
  updatedAt: string
}

export interface SkillVersion {
  id: number
  skillId: number
  versionNumber: string
  changeLog: string
  filePath: string
  fileSize: number
  uploaderId: number
  uploaderName?: string
  createdAt: string
}

export interface SkillVisibility {
  id: number
  skillId: number
  targetType: 'project' | 'account'
  targetId: number
  targetName?: string
}

export interface SkillSearchParams {
  keyword?: string
  categoryId?: number
  sourceType?: SkillSourceType
  status?: SkillStatus
  page?: number
  pageSize?: number
}

export interface SkillSubmitData {
  name: string
  summary: string
  detail: string
  author: string
  categoryId: number
  sourceType: SkillSourceType
  sourceUrl?: string
  sourceUrlName?: string
  visibilityType: VisibilityType
  visibilityTargets?: number[]
  projectId?: number
  file?: File
  versionNumber: string
  changeLog?: string
}

export interface Review {
  id: number
  skillId: number
  skillName?: string
  reviewerId: number
  reviewerName?: string
  status: string
  comment: string
  createdAt: string
}

export interface Rating {
  id: number
  skillId: number
  versionId: number
  userId: number
  userName?: string
  score: number
  createdAt: string
}

export interface Feedback {
  id: number
  skillId: number
  userId: number
  userName?: string
  content: string
  isInvalid: boolean
  createdAt: string
}

export interface DownloadRecord {
  id: number
  skillId: number
  skillName?: string
  versionId: number
  versionNumber?: string
  userId: number
  createdAt: string
  hasNewVersion?: boolean
}

// 通用分页
export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 枚举
export enum SkillStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  UNPUBLISHED = 'unpublished',
}

export enum SkillSourceType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum VisibilityType {
  ALL = 'all',
  PROJECT = 'project',
  ACCOUNT = 'account',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ProjectRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

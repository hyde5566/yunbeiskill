export interface UserInfo {
  id: number
  username: string
  name: string
  realName?: string
  email: string
  phone: string
  departmentId: number
  departmentName?: string
  permissions: string[]
  isAdmin: boolean
  status: number
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  accessToken: string
  user: UserInfo
}

export interface Department {
  id: number
  name: string
  parentId: number | null
  sort: number
  status: number
  children?: Department[]
}

export interface UserPermission {
  id: number
  userId: number
  permissionType: string
}

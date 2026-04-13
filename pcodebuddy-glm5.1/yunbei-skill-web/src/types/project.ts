export interface Project {
  id: number
  name: string
  description: string
  ownerName: string
  ownerContact: string
  status: number
  memberCount?: number
  skillCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  userName?: string
  realName?: string
  role: string
  joinedAt: string
}

export interface ProjectSkill {
  id: number
  projectId: number
  skillId: number
  skillName?: string
  addedAt: string
}

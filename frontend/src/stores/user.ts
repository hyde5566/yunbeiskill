import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserPermissions, type UserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const permissions = ref<string[]>([])

  async function loginAction(username: string, password: string) {
    const res = await login({ username, password })
    userInfo.value = res.data
    token.value = res.data.token
    permissions.value = res.data.permissions || []
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('permissions', JSON.stringify(permissions.value))
    return res.data
  }

  async function logoutAction() {
    await logout()
    userInfo.value = null
    token.value = null
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('permissions')
  }

  async function loadPermissions() {
    if (!token.value) return []
    try {
      const res = await getUserPermissions()
      permissions.value = res.data
      localStorage.setItem('permissions', JSON.stringify(permissions.value))
      return res.data
    } catch {
      return []
    }
  }

  function initPermissions() {
    const stored = localStorage.getItem('permissions')
    if (stored) {
      try {
        permissions.value = JSON.parse(stored)
      } catch {
        permissions.value = []
      }
    }
  }

  function hasPermission(code: string): boolean {
    return permissions.value.includes(code)
  }

  return {
    userInfo,
    token,
    permissions,
    loginAction,
    logoutAction,
    loadPermissions,
    initPermissions,
    hasPermission
  }
})
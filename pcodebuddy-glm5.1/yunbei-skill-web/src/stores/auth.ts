import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '../types/user'
import { login as loginApi, getProfile } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isAdmin || user.value?.permissions?.includes('admin') || false)
  const isReviewer = computed(() => user.value?.permissions?.includes('review') || false)
  const hasReviewPermission = computed(() => isAdmin.value || isReviewer.value)
  const userPermissions = computed(() => user.value?.permissions || [])

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(userInfo: any) {
    user.value = userInfo
    localStorage.setItem('user', JSON.stringify(userInfo))
    localStorage.setItem('permissions', JSON.stringify(userInfo.permissions || []))
  }

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    const token = res.data?.token || res.data?.access_token
    if (token) {
      setToken(token)
      await fetchUser()
    }
  }

  async function fetchUser() {
    try {
      const res = await getProfile()
      setUser(res.data)
    } catch (e) {
      console.error('Failed to fetch user profile:', e)
    }
  }

  function loadUserFromStorage() {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        user.value = JSON.parse(stored)
      } catch {
        user.value = null
      }
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
  }

  function hasPermission(perm: string): boolean {
    if (isAdmin.value) return true
    return userPermissions.value.includes(perm)
  }

  // 初始化时从localStorage加载
  loadUserFromStorage()

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isReviewer,
    hasReviewPermission,
    userPermissions,
    login,
    setToken,
    setUser,
    fetchUser,
    loadUserFromStorage,
    logout,
    hasPermission,
  }
})

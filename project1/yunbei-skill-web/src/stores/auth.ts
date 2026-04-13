import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo } from '@/api/auth'
import { storage } from '@/utils/storage'
import type { UserInfo } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(storage.getToken() || '')
  const userInfo = ref<UserInfo | null>(null)

  // 初始化时从localStorage恢复userInfo
  function init() {
    const savedUser = storage.get('userInfo')
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
      } catch (e) {
        userInfo.value = null
      }
    }
  }

  // 登录
  async function doLogin(username: string, password: string) {
    const res = await login({ username, password })
    token.value = res.token
    userInfo.value = res.user as UserInfo
    storage.setToken(res.token)
    storage.set('userInfo', JSON.stringify(res.user))
    return res
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      userInfo.value = await getUserInfo()
      storage.set('userInfo', JSON.stringify(userInfo.value))
    } catch (error) {
      logout()
      throw error
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    storage.removeToken()
    storage.remove('userInfo')
  }

  // 检查权限
  function hasPermission(perm: string): boolean {
    return userInfo.value?.permissions?.includes(perm) || false
  }

  // 是否是管理员
  function isAdmin(): boolean {
    return hasPermission('admin')
  }

  // 初始化
  init()

  return {
    token,
    userInfo,
    doLogin,
    logout,
    fetchUserInfo,
    hasPermission,
    isAdmin
  }
})
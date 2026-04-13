// localStorage 封装
const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

export const storage = {
  get(key: string): string | null {
    return localStorage.getItem(key)
  },
  set(key: string, value: string): void {
    localStorage.setItem(key, value)
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  getToken(): string | null {
    return this.get(TOKEN_KEY)
  },
  setToken(token: string): void {
    this.set(TOKEN_KEY, token)
  },
  removeToken(): void {
    this.remove(TOKEN_KEY)
  },
  getUserInfo(): string | null {
    return this.get(USER_INFO_KEY)
  },
  setUserInfo(info: string): void {
    this.set(USER_INFO_KEY, info)
  },
  removeUserInfo(): void {
    this.remove(USER_INFO_KEY)
  }
}
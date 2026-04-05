import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    message.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
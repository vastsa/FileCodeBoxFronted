import axios from 'axios'
import { TIME_CONSTANTS } from '@/constants'

// 从环境变量中获取 API 基础 URL
const baseURL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_DEV
// 确保 baseURL 是一个有效的字符串
const sanitizedBaseURL = typeof baseURL === 'string' ? baseURL : ''

// 创建 axios 实例
const api = axios.create({
  baseURL: sanitizedBaseURL,
  timeout: TIME_CONSTANTS.REQUEST_TIMEOUT, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 确保 URL 是有效的
    if (config.url && !config.url.startsWith('http')) {
      config.url = `${sanitizedBaseURL}/${config.url.replace(/^\//, '')}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          // 使用 router 进行导航而不是直接修改 location
          if (window.location.hash !== '#/login') {
            window.location.href = '/#/login'
          }
          break
        case 403:
        case 404:
        case 500:
        default:
          // 错误信息通过Promise.reject传递给调用方处理
          break
      }
    } else if (error.request) {
      // 网络错误，通过Promise.reject传递给调用方处理
    } else {
      // 请求配置错误，通过Promise.reject传递给调用方处理
    }
    return Promise.reject(error)
  }
)

export default api

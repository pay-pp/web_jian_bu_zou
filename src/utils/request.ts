// src/utils/request.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// 判断是否是开发环境
const isDev = import.meta.env.DEV

// 统一后端响应
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data: T
}

// 1. 创建 Axios 实例
const http: AxiosInstance = axios.create({
  baseURL: isDev ? '/api' : '/jian_bu_zou', // 开发代理 / 生产 WAR 上下文
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

// 2. 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 3. 响应拦截器
http.interceptors.response.use(
  (res: AxiosResponse) => {
    // 如果是 blob 类型（文件下载），直接返回，不检查 ApiResponse 格式
    if (res.data instanceof Blob) {
      return res
    }

    // 普通 JSON 响应，检查 ApiResponse 格式
    const data = res.data as ApiResponse
    if (!data.success) {
      ElMessage.error(data.message ?? '业务异常')
      return Promise.reject(new Error(data.message ?? '业务异常'))
    }
    // ⚠️ 返回整个 AxiosResponse，这样不会报 TS 错误
    return res
  },
  (err: AxiosError) => {
    // 处理401未授权，自动登出
    if (err.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // 延迟跳转，避免在路由守卫中重复处理
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    // 处理网络错误
    if (!err.response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(err)
    }

    // 处理文件下载错误（blob 响应）
    if (err.config?.responseType === 'blob') {
      ElMessage.error('文件下载失败，请稍后重试')
      return Promise.reject(err)
    }

    // 处理其他HTTP错误
    const data = err.response.data as ApiResponse | undefined
    const msg = data?.message ?? err.message ?? '请求失败'
    ElMessage.error(msg)
    return Promise.reject(err)
  },
)

/**
 * 4. 封装 request<T>，返回最终 data
 */
export async function request<T>(config: Parameters<AxiosInstance['request']>[0]): Promise<T> {
  const res = await http.request<ApiResponse<T>>(config)
  return res.data.data
}

export default http

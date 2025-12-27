import { defineStore } from 'pinia'
import { request } from '@/utils/request'

interface LoginResult {
  token: string
  name: string
  unionId: string | number
  unionName: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '' as string,
    userInfo: null as LoginResult | null,
    expiryAt: null as number | null, // 过期时间戳（毫秒）
  }),

  getters: {
    isLogin: (state) => {
      if (!state.token || !state.expiryAt) return false
      return state.expiryAt > Date.now()
    },
    unionInfo: (state) => ({
      unionId: state.userInfo?.unionId || '',
      unionName: state.userInfo?.unionName || '',
    }),
  },

  actions: {
    /**
     * 从 token 字符串中解析时间戳：token_1765178256460 -> 1765178256460
     */
    extractTimestamp(token: string): number | null {
      const match = token.match(/token_(\d+)/)
      if (!match) return null
      return Number(match[1])
    },

    async login(account: string, password: string): Promise<boolean> {
      try {
        const res = await request<LoginResult>({
          url: '/user/login',
          method: 'post',
          data: { account: account, password: password },
        })

        const issuedAt = this.extractTimestamp(res.token)
        if (!issuedAt) throw new Error('无效 token 格式')

        const expiryAt = issuedAt + 7 * 24 * 60 * 60 * 1000 // 7 天有效期

        this.token = res.token
        this.userInfo = {
          token: res.token,
          name: res.name,
          unionId: res.unionId,
          unionName: res.unionName,
        }
        this.expiryAt = expiryAt

        // 2. 持久化（供刷新后拦截器读取）
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        localStorage.setItem('tokenExpiryAt', String(expiryAt))
        return true
      } catch (error) {
        console.error('登录失败', error)
        return false
      }
    },
    //刷新页面后恢复本地存储
    restoreState() {
      const token = localStorage.getItem('token')
      const userInfoStr = localStorage.getItem('userInfo')
      const expiryAtStr = localStorage.getItem('tokenExpiryAt')

      if (!token || !expiryAtStr) {
        this.logout()
        return false
      }

      const expiryAt = Number(expiryAtStr)
      if (!expiryAt || Date.now() > expiryAt) {
        this.logout()
        return false
      }

      this.token = token // 把本地存储的 token 恢复到 state
      if (userInfoStr) this.userInfo = JSON.parse(userInfoStr) // 恢复 userInfo
      this.expiryAt = expiryAt
      return true
    },
    //退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('tokenExpiryAt')
      // 清理自动登录保存的账号密码
      localStorage.removeItem('autoLoginEnabled')
      localStorage.removeItem('autoLoginAccount')
      localStorage.removeItem('autoLoginPassword')
    },
  },
})

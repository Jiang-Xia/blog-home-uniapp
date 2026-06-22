import type { ILoginForm } from '@/api/login'
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken, wxLogin as apiWxLogin, emailLogin, exchangeOAuthTicket, getWxCode, toTokenInfo } from '@/api/login'
import type { IAuthLoginRes } from '@/api/types/login'
import { isDoubleTokenRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clearPersistedAccessToken, persistAccessToken } from '@/utils/auth-token'
import { isDoubleTokenMode } from '@/utils'
import { useUserStore } from './user'

const tokenInfoState: IAuthLoginRes = isDoubleTokenMode
  ? {
      accessToken: '',
      refreshToken: '',
      accessExpiresIn: 0,
      refreshExpiresIn: 0,
    }
  : {
      token: '',
      expiresIn: 0,
    }

export const useTokenStore = defineStore(
  'token',
  () => {
    const tokenInfo = ref<IAuthLoginRes>({ ...tokenInfoState })
    const nowTime = ref(Date.now())

    const updateNowTime = () => {
      nowTime.value = Date.now()
      return useTokenStore()
    }

    const setTokenInfo = (val: IAuthLoginRes) => {
      updateNowTime()
      tokenInfo.value = val
      const now = Date.now()
      if (isDoubleTokenRes(val)) {
        persistAccessToken(val.accessToken)
        uni.setStorageSync('accessTokenExpireTime', now + val.accessExpiresIn * 1000)
        uni.setStorageSync('refreshTokenExpireTime', now + val.refreshExpiresIn * 1000)
      }
      else {
        persistAccessToken(val.token)
        uni.setStorageSync('accessTokenExpireTime', now + val.expiresIn * 1000)
      }
    }

    const isTokenExpired = computed(() => {
      const expireTime = uni.getStorageSync('accessTokenExpireTime')
      if (!expireTime)
        return false
      return nowTime.value >= expireTime
    })

    const isRefreshTokenExpired = computed(() => {
      if (!isDoubleTokenMode)
        return true
      const refreshExpireTime = uni.getStorageSync('refreshTokenExpireTime')
      if (!refreshExpireTime)
        return true
      return nowTime.value >= refreshExpireTime
    })

    async function _postLogin(res: IAuthLoginRes) {
      setTokenInfo(res)
      const userStore = useUserStore()
      await userStore.fetchUserInfo()
    }

    const login = async (loginForm: ILoginForm) => {
      try {
        const res = await apiLogin(loginForm)
        await _postLogin(toTokenInfo(res))
        uni.showToast({ title: '登录成功', icon: 'success' })
        return res
      }
      catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    const loginByEmail = async (params: { email: string, verificationCode: string }) => {
      try {
        const res = await emailLogin(params)
        await _postLogin(toTokenInfo(res))
        uni.showToast({ title: '登录成功', icon: 'success' })
        return res
      }
      catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    const wxLogin = async () => {
      try {
        const code = await getWxCode()
        const res = await apiWxLogin(code)
        await _postLogin(toTokenInfo(res))
        uni.showToast({ title: '登录成功', icon: 'success' })
        return res
      }
      catch (error) {
        uni.showToast({ title: '微信登录失败', icon: 'none' })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /** H5 GitHub OAuth：用回调 ticket 兑换双 token 并拉取用户信息 */
    const loginByOAuthTicket = async (ticket: string) => {
      try {
        const res = await exchangeOAuthTicket(ticket)
        await _postLogin(toTokenInfo(res))
        uni.showToast({ title: '登录成功', icon: 'success' })
        return res
      }
      catch (error) {
        uni.showToast({ title: '登录凭证无效或已过期', icon: 'none' })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    const logout = async () => {
      try {
        await apiLogout()
      }
      catch (error) {
        console.error('退出登录失败:', error)
      }
      finally {
        updateNowTime()
        uni.removeStorageSync('accessTokenExpireTime')
        uni.removeStorageSync('refreshTokenExpireTime')
        clearPersistedAccessToken()
        tokenInfo.value = { ...tokenInfoState }
        const userStore = useUserStore()
        userStore.clearUserInfo()
      }
    }

    const refreshToken = async () => {
      if (!isDoubleTokenMode || !isDoubleTokenRes(tokenInfo.value) || !tokenInfo.value.refreshToken) {
        throw new Error('无法刷新 token')
      }
      try {
        const res = await apiRefreshToken(tokenInfo.value.refreshToken)
        setTokenInfo({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          accessExpiresIn: 30 * 60,
          refreshExpiresIn: 7 * 24 * 3600,
        })
        if (res.user) {
          const userStore = useUserStore()
          userStore.setUserInfo(await import('@/utils/user-map').then(m => m.mapServerUser(res.user!)))
        }
        return res
      }
      finally {
        updateNowTime()
      }
    }

    const getValidToken = computed(() => {
      if (isTokenExpired.value)
        return ''
      if (isDoubleTokenRes(tokenInfo.value))
        return tokenInfo.value.accessToken || ''
      return 'token' in tokenInfo.value ? tokenInfo.value.token : ''
    })

    const hasLoginInfo = computed(() => {
      if (isDoubleTokenRes(tokenInfo.value))
        return !!tokenInfo.value.accessToken
      return 'token' in tokenInfo.value && !!tokenInfo.value.token
    })

    const hasValidLogin = computed(() => hasLoginInfo.value && !isTokenExpired.value)

    const tryGetValidToken = async (): Promise<string> => {
      updateNowTime()
      if (!getValidToken.value && isDoubleTokenMode && !isRefreshTokenExpired.value) {
        try {
          await refreshToken()
          return getValidToken.value
        }
        catch {
          return ''
        }
      }
      return getValidToken.value
    }

    return {
      login,
      loginByEmail,
      wxLogin,
      loginByOAuthTicket,
      logout,
      hasLogin: hasValidLogin,
      refreshToken,
      tryGetValidToken,
      validToken: getValidToken,
      tokenInfo,
      setTokenInfo,
      updateNowTime,
    }
  },
  { persist: true },
)

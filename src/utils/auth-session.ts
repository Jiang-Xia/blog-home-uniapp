/**
 * 应用启动/回前台时恢复登录态
 * - Pinia 持久化 token 后，accessToken 过期则用 refreshToken 静默续期
 * - 用户信息缺失时补拉 /user/info
 */
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'
import { persistAccessToken } from '@/utils/auth-token'

/** 从本地缓存恢复登录会话（不抛错，供 onLaunch/onShow 调用） */
export async function restoreAuthSession(): Promise<void> {
  const tokenStore = useTokenStore()
  const userStore = useUserStore()
  tokenStore.updateNowTime()

  if (!tokenStore.hasLoginInfo)
    return

  if (!tokenStore.validToken)
    await tokenStore.tryGetValidToken()

  if (!tokenStore.hasLogin)
    return

  const accessToken = tokenStore.validToken
  if (accessToken)
    persistAccessToken(accessToken)

  if (userStore.userInfo.userId > 0)
    return

  try {
    await userStore.fetchUserInfo()
  }
  catch {
    // 用户信息拉取失败不强制登出，避免弱网误踢
  }
}

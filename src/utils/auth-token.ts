/**
 * accessToken 持久化与登录响应解包
 * - 与 Pinia token store 解耦，供 http 拦截器同步读取 Authorization
 */
export const ACCESS_TOKEN_STORAGE_KEY = 'blog_access_token'

/** 写入 accessToken 到 uni.storage（空字符串则清除） */
export function persistAccessToken(token: string) {
  if (token)
    uni.setStorageSync(ACCESS_TOKEN_STORAGE_KEY, token)
  else
    uni.removeStorageSync(ACCESS_TOKEN_STORAGE_KEY)
}

/** 读取持久化的 accessToken（登录后立即发起的请求使用） */
export function getPersistedAccessToken(): string {
  return uni.getStorageSync(ACCESS_TOKEN_STORAGE_KEY) || ''
}

/** 清除持久化 accessToken（logout 时） */
export function clearPersistedAccessToken() {
  uni.removeStorageSync(ACCESS_TOKEN_STORAGE_KEY)
}

/** 从登录/刷新接口 data 解包 token（兼容 info 包装与扁平结构） */
export function normalizeLoginPayload(data: unknown): {
  accessToken?: string
  refreshToken?: string
  token?: string
  user?: Record<string, unknown>
} {
  if (!data || typeof data !== 'object')
    throw new Error('登录响应无效')
  const d = data as Record<string, unknown>
  const info = d.info
  if (info && typeof info === 'object')
    return info as ReturnType<typeof normalizeLoginPayload>
  return d as ReturnType<typeof normalizeLoginPayload>
}

/** 从解包后的 payload 取 accessToken（兼容单 token 模式） */
export function pickAccessToken(payload: ReturnType<typeof normalizeLoginPayload>): string {
  return payload.accessToken || payload.token || ''
}

/** 从解包后的 payload 取 refreshToken */
export function pickRefreshToken(payload: ReturnType<typeof normalizeLoginPayload>): string {
  return payload.refreshToken || ''
}

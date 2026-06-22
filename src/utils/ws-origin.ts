import { getEnvBaseUrl } from '@/utils'

/** WebSocket 连接 origin（去掉 /api/v1 后缀） */
export function getWsOrigin() {
  return getEnvBaseUrl().replace(/\/api\/v1\/?$/, '')
}

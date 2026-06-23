import { getEnvBaseUrl } from '@/utils'

/** WebSocket 连接 origin（对齐 blog-home-nuxt originUrl） */
export function getWsOrigin() {
  const configured = import.meta.env.VITE_WS_ORIGIN?.replace(/\/$/, '')
  if (configured)
    return configured
  return getEnvBaseUrl().replace(/\/x-blog\/api\/v1\/?$/, '').replace(/\/api\/v1\/?$/, '')
}

/** 静态资源前缀（上传封面、头像等 /static 路径） */
export function getStaticBaseUrl() {
  const configured = import.meta.env.VITE_STATIC_BASEURL?.replace(/\/$/, '')
  if (configured)
    return configured
  return getWsOrigin()
}

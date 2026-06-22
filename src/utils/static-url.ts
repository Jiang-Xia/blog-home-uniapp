import { getWsOrigin } from '@/utils/ws-origin'

/**
 * 将 /static 相对路径解析为可访问的完整 URL
 * - 上传接口返回相对路径，Markdown 编辑器与 image 组件需完整 URL
 */
export function resolveStaticUrl(path = ''): string {
  if (!path)
    return ''
  if (path.startsWith('http') || path.includes('base64'))
    return path
  if (path.startsWith('/static'))
    return `${getWsOrigin()}${path}`
  return path
}

/** 从上传接口响应中解析 /static 相对路径 */
export function parseUploadedPath(res: unknown): string {
  if (!res)
    return ''
  if (Array.isArray(res))
    return (res[0] as { url?: string })?.url || ''
  const wrapped = res as { data?: unknown, url?: string }
  if (Array.isArray(wrapped.data))
    return (wrapped.data[0] as { url?: string })?.url || ''
  if (wrapped.data && typeof wrapped.data === 'object' && 'url' in (wrapped.data as object))
    return (wrapped.data as { url?: string }).url || ''
  return wrapped.url || ''
}

/** 上传完成后拼接域名，供编辑器插入 Markdown 图片 */
export function parseUploadedUrl(res: unknown): string {
  return resolveStaticUrl(parseUploadedPath(res))
}

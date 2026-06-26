/** 对齐 blog-server / blog-home-nuxt 统一响应体 */
export interface ApiResponse<T = unknown> {
  success?: boolean
  code: number
  bizCode?: number
  message: string
  data: T
}

export function isApiSuccess(code: number) {
  return code === 0 || code === 200
}

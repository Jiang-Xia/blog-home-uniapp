/**
 * RPG 本地挡板可用范围：
 * - 开发环境：任意页面
 * - 生产环境：仅 pages-tool/test 测试页
 */
import { currRoute } from '@/utils'

export function canUseRpgDevMock(): boolean {
  if (import.meta.env.DEV)
    return true
  const { path } = currRoute()
  return path.includes('/pages-tool/test')
}

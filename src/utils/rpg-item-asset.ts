/**
 * RPG 物品图标资产解析（对齐 blog-home-nuxt/utils/rpg-item-asset.ts）
 * 加载顺序：API iconUrl → static/rpg/icons → emoji
 */
import type { RpgItemIconSource } from '@/utils/rpg-item-icon'
import { resolveStaticUrl } from '@/utils/static-url'

/** 已在 static/rpg/icons/ 提供文件的 icon 键 */
export const RPG_ICON_ASSET_KEYS = new Set([
  'board',
  'bookmark',
  'bookmarks',
  'books',
  'calendar',
  'calendar-check',
  'cat',
  'chat',
  'crown',
  'crown-star',
  'diamond',
  'dragon',
  'egg',
  'exp',
  'fire',
  'flame',
  'fox',
  'frame-blue',
  'frame-gold',
  'frame-green',
  'frame-purple',
  'gem',
  'heart',
  'hearts',
  'kirin',
  'library',
  'medal-bronze',
  'medal-gold',
  'medal-silver',
  'megaphone',
  'moon',
  'owl',
  'pen',
  'phoenix',
  'quill',
  'rainbow',
  'reply',
  'scroll',
  'share',
  'shield',
  'slime',
  'star',
  'starburst',
  'stars',
  'sun',
  'ticket',
  'trophy',
])

const RASTER_EXT = ['png', 'webp'] as const
const VECTOR_EXT = ['svg'] as const

export const RPG_ICON_RASTER_KEYS = new Set<string>([])

export interface RpgItemAssetOptions {
  iconUrl?: string | null
  bgUrl?: string | null
}

/** icon 键是否有本地静态资产 */
export function hasRpgIconAsset(key?: string | null): boolean {
  const normalized = key?.trim()
  return !!normalized && normalized !== 'default' && RPG_ICON_ASSET_KEYS.has(normalized)
}

/** 按 icon 键生成本地候选 URL */
export function buildLocalIconAssetUrls(key: string): string[] {
  const base = `/static/rpg/icons/${key}`
  const urls: string[] = []
  if (RPG_ICON_RASTER_KEYS.has(key))
    urls.push(...RASTER_EXT.map(ext => `${base}.${ext}`))
  urls.push(...VECTOR_EXT.map(ext => `${base}.${ext}`))
  return urls
}

/** 构建图片候选链（iconUrl → 本地 icons） */
export function buildRpgItemAssetCandidates(
  source?: RpgItemIconSource | null,
  options?: RpgItemAssetOptions,
): string[] {
  const urls: string[] = []
  if (options?.iconUrl)
    urls.push(resolveStaticUrl(options.iconUrl))
  if (!source)
    return urls
  const key = source.icon?.trim()
  if (!key || key === 'default')
    return urls
  if (hasRpgIconAsset(key))
    urls.push(...buildLocalIconAssetUrls(key).map(u => resolveStaticUrl(u)))
  return urls
}

/** 解析背景图 URL */
export function resolveRpgItemBgUrl(bgUrl?: string | null): string | undefined {
  if (!bgUrl)
    return undefined
  return resolveStaticUrl(bgUrl)
}

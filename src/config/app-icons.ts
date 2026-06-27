/**
 * 项目彩色 SVG 图标名
 * - 文件：src/static/my-icons/{name}.svg
 * - 使用：<cyber-icon name="user" />
 * - 改 SVG 后执行：pnpm gen:icons
 */
export const APP_ICON_NAMES = [
  'user',
  'edit-pen',
  'article',
  'star',
  'comment',
  'inbox',
  'dashboard',
  'logout',
  'archive',
  'sparkle',
  'info',
  'sword',
  'book',
  'link',
  'tools',
  'lock',
  'key',
  'robot',
  'package',
  'broadcast',
  'warning',
  'bulb',
  'heart',
  'bookmark',
  'gem',
] as const

export type AppIconName = typeof APP_ICON_NAMES[number]

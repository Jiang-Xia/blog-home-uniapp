/**
 * 全站主题常量 — 对齐 blog-home-nuxt `cyber` / `cyber-light`
 * 原生导航栏、窗口背景等 chrome 色在 pages.json 为编译期默认，运行时由 use-theme 刷新
 */

export const TECH_THEMES = ['cyber', 'cyber-light'] as const
export type TechTheme = (typeof TECH_THEMES)[number]

/**
 * 用户主题偏好
 * - system：跟随系统深浅色（默认）
 * - cyber / cyber-light：手动锁定
 */
export const THEME_PREFERENCES = ['system', 'cyber', 'cyber-light'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]

/** uni.storage 键，存偏好（含 system） */
export const THEME_STORAGE_KEY = 'app-theme'

export interface ThemeChrome {
  /** 页面 / 窗口底色 */
  shell: string
  /** 导航栏背景 */
  navBg: string
  /** 导航栏前景：黑字或白字 */
  navFront: 'black' | 'white'
  /** Tab 未选中色 */
  tabInactive: string
  /** Tab 选中色（与 --tech-primary 一致） */
  tabActive: string
  /** 主色 */
  primary: string
}

/** 各主题原生 chrome 色值（避免从 CSS 读，小程序无 getComputedStyle） */
export const THEME_CHROME: Record<TechTheme, ThemeChrome> = {
  'cyber': {
    shell: '#050505',
    navBg: '#050505',
    navFront: 'white',
    tabInactive: 'rgba(255,255,255,0.45)',
    tabActive: '#22d3ee',
    primary: '#22d3ee',
  },
  'cyber-light': {
    shell: '#f0f4f9',
    navBg: '#f0f4f9',
    navFront: 'black',
    tabInactive: 'rgba(15,23,42,0.45)',
    tabActive: '#0891b2',
    primary: '#0891b2',
  },
}

/** 是否为有效主题偏好 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'cyber' || value === 'cyber-light'
}

/** 是否为深色（夜间）主题 */
export function isDarkTheme(name: string): boolean {
  return name !== 'cyber-light'
}

/**
 * 读取系统是否深色
 * - H5：prefers-color-scheme
 * - 小程序 / App：uni.getSystemInfoSync().theme（或 osTheme）
 * - 无法判断时回落深色（cyber）
 */
export function getSystemIsDark(): boolean {
  // #ifdef H5
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    catch {
      // fall through
    }
  }
  // #endif

  try {
    const info = uni.getSystemInfoSync() as UniApp.GetSystemInfoResult & {
      theme?: string
      osTheme?: string
    }
    const t = info.theme || info.osTheme
    if (t === 'dark')
      return true
    if (t === 'light')
      return false
  }
  catch {
    // ignore
  }
  return true
}

/** 将偏好解析为实际生效主题 */
export function resolveTheme(preference: ThemePreference): TechTheme {
  if (preference === 'system')
    return getSystemIsDark() ? 'cyber' : 'cyber-light'
  return preference
}

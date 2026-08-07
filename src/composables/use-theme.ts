/**
 * 全站主题 composable：cyber（夜间）↔ cyber-light（白天）
 * - 默认偏好 system：跟随系统深浅色，并监听变化
 * - 手动锁定 cyber / cyber-light 后不再跟系统
 * - 持久化：uni.setStorageSync(THEME_STORAGE_KEY)
 * - 副作用：同步原生导航栏/窗口底色；H5 写 html[data-theme]
 * - 样式宿主：App.ku.vue 根节点 `.app-theme-root[data-theme]`
 */
import { computed, ref } from 'vue'
import {
  getSystemIsDark,
  isDarkTheme,
  isThemePreference,
  resolveTheme,

  THEME_CHROME,
  THEME_STORAGE_KEY,

} from '@/constants/theme'
import type { TechTheme, ThemePreference } from '@/constants/theme'

export {
  getSystemIsDark,
  isDarkTheme,
  isThemePreference,
  resolveTheme,
  TECH_THEMES,
  THEME_CHROME,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
} from '@/constants/theme'
export type { TechTheme, ThemeChrome, ThemePreference } from '@/constants/theme'

/** 默认跟随系统 */
const DEFAULT_PREFERENCE: ThemePreference = 'system'

/** 从本地读取偏好；非法 / 空 → system */
function readStoredPreference(): ThemePreference {
  try {
    const raw = uni.getStorageSync(THEME_STORAGE_KEY)
    if (isThemePreference(raw))
      return raw
  }
  catch {
    // ignore
  }
  return DEFAULT_PREFERENCE
}

const preference = ref<ThemePreference>(readStoredPreference())
const theme = ref<TechTheme>(resolveTheme(preference.value))

let h5MediaQuery: MediaQueryList | null = null
let mpThemeChangeBound = false

/** 同步原生导航栏、窗口背景；H5 同步 documentElement */
function syncNativeChrome(name: TechTheme) {
  const chrome = THEME_CHROME[name]
  try {
    uni.setNavigationBarColor({
      frontColor: chrome.navFront === 'black' ? '#000000' : '#ffffff',
      backgroundColor: chrome.navBg,
      animation: {
        duration: 200,
        timingFunc: 'easeIn',
      },
    })
  }
  catch {
    // 部分端或无导航栏页面可能失败
  }
  try {
    uni.setBackgroundColor({
      backgroundColor: chrome.shell,
      backgroundColorTop: chrome.shell,
      backgroundColorBottom: chrome.shell,
    })
  }
  catch {
    // App / 部分端不支持
  }

  // #ifdef H5
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.setAttribute('data-theme', name)
    root.classList.add('tech-shell')
    root.style.colorScheme = name === 'cyber-light' ? 'light' : 'dark'
    if (document.body)
      document.body.style.backgroundColor = chrome.shell
    const app = document.getElementById('app')
    if (app)
      app.style.backgroundColor = chrome.shell
  }
  // #endif
}

/** 写入 storage（不抛错） */
function persistPreference(pref: ThemePreference) {
  try {
    uni.setStorageSync(THEME_STORAGE_KEY, pref)
  }
  catch {
    // ignore
  }
}

/**
 * 应用偏好：解析实际主题、可选持久化、刷新 chrome
 * @param persist 为 false 时仅刷新（如系统主题变化）
 */
function applyPreference(pref: ThemePreference, persist = true) {
  preference.value = pref
  const resolved = resolveTheme(pref)
  theme.value = resolved
  if (persist)
    persistPreference(pref)
  syncNativeChrome(resolved)
}

/** 系统主题变化时：仅在跟随系统时重算 */
function onSystemThemeChange() {
  if (preference.value !== 'system')
    return
  applyPreference('system', false)
}

/** 绑定系统主题监听（可重复调用，内部去重） */
function bindSystemThemeListener() {
  // #ifdef H5
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && !h5MediaQuery) {
    h5MediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => onSystemThemeChange()
    if (typeof h5MediaQuery.addEventListener === 'function')
      h5MediaQuery.addEventListener('change', handler)
    else
      // 旧 Safari
      h5MediaQuery.addListener(handler)
  }
  // #endif

  // #ifndef H5
  if (!mpThemeChangeBound && typeof uni.onThemeChange === 'function') {
    mpThemeChangeBound = true
    uni.onThemeChange(() => onSystemThemeChange())
  }
  // #endif
}

/**
 * 设置主题偏好（system / cyber / cyber-light）
 */
export function setThemePreference(pref: ThemePreference) {
  applyPreference(pref, true)
}

/**
 * 锁定为指定实际主题（关闭跟随系统）
 */
export function applyTheme(name: TechTheme) {
  applyPreference(name, true)
}

/** 在 cyber ↔ cyber-light 间手动锁定切换 */
export function toggleTheme() {
  applyTheme(theme.value === 'cyber' ? 'cyber-light' : 'cyber')
}

/** 开启 / 关闭跟随系统；关闭时保留当前已解析主题 */
export function setFollowSystem(follow: boolean) {
  if (follow) {
    applyPreference('system', true)
    return
  }
  applyPreference(theme.value, true)
}

/** App 启动：读偏好、应用、监听系统主题 */
export function initTheme() {
  bindSystemThemeListener()
  applyPreference(readStoredPreference(), true)
}

/**
 * 页面级主题 API（单例状态，多组件共享）
 * 切换后 CSS 变量经 `.app-theme-root[data-theme]` 继承；须再 sync 原生 chrome
 */
export function useTheme() {
  const isDark = computed(() => isDarkTheme(theme.value))
  const isLight = computed(() => theme.value === 'cyber-light')
  const followSystem = computed(() => preference.value === 'system')
  const chrome = computed(() => THEME_CHROME[theme.value])
  const shellColor = computed(() => chrome.value.shell)
  const primaryColor = computed(() => chrome.value.primary)

  return {
    theme,
    preference,
    followSystem,
    isDark,
    isLight,
    chrome,
    shellColor,
    primaryColor,
    setTheme: applyTheme,
    setThemePreference,
    setFollowSystem,
    toggleTheme,
    initTheme,
    /** 当前系统是否深色（调试 / 文案用） */
    getSystemIsDark,
    /** 路由切换后重新刷导航栏（页面 style 可能覆盖） */
    syncNativeChrome: () => syncNativeChrome(theme.value),
  }
}

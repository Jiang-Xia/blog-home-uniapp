/**
 * 主题常量单测
 */
import { describe, expect, it } from 'vitest'
import {
  isDarkTheme,
  isThemePreference,
  resolveTheme,
  TECH_THEMES,
  THEME_CHROME,
} from '@/constants/theme'

describe('theme constants', () => {
  it('仅含 cyber 与 cyber-light', () => {
    expect([...TECH_THEMES]).toEqual(['cyber', 'cyber-light'])
  })

  it('cyber 为深色，cyber-light 为浅色', () => {
    expect(isDarkTheme('cyber')).toBe(true)
    expect(isDarkTheme('cyber-light')).toBe(false)
  })

  it('chrome 色表覆盖双主题', () => {
    expect(THEME_CHROME.cyber.shell).toBe('#050505')
    expect(THEME_CHROME['cyber-light'].shell).toBe('#f0f4f9')
    expect(THEME_CHROME.cyber.navFront).toBe('white')
    expect(THEME_CHROME['cyber-light'].navFront).toBe('black')
  })

  it('识别合法偏好含 system', () => {
    expect(isThemePreference('system')).toBe(true)
    expect(isThemePreference('cyber')).toBe(true)
    expect(isThemePreference('cyber-light')).toBe(true)
    expect(isThemePreference('dark')).toBe(false)
    expect(isThemePreference('')).toBe(false)
  })

  it('手动偏好直接解析为对应主题', () => {
    expect(resolveTheme('cyber')).toBe('cyber')
    expect(resolveTheme('cyber-light')).toBe('cyber-light')
  })

  it('system 解析结果为合法主题', () => {
    expect(['cyber', 'cyber-light']).toContain(resolveTheme('system'))
  })
})

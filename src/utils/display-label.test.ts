import { describe, expect, it } from 'vitest'
import { apiDisplayLabel } from './display-label'

describe('apiDisplayLabel', () => {
  it('优先 label', () => {
    expect(apiDisplayLabel({ label: '前端', name: 'frontend' })).toBe('前端')
  })

  it('无 label 时 fallback name', () => {
    expect(apiDisplayLabel({ name: '物品名' })).toBe('物品名')
  })

  it('空对象返回 fallback', () => {
    expect(apiDisplayLabel(null, '默认')).toBe('默认')
  })
})

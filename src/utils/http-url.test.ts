import { describe, expect, it } from 'vitest'
import { isValidHttpUrl, normalizeHttpUrl } from './http-url'

describe('normalizeHttpUrl', () => {
  it('补全 https 协议', () => {
    expect(normalizeHttpUrl('example.com')).toBe('https://example.com')
    expect(normalizeHttpUrl('www.example.com/path')).toBe('https://www.example.com/path')
  })

  it('保留已有协议', () => {
    expect(normalizeHttpUrl('http://example.com')).toBe('http://example.com')
    expect(normalizeHttpUrl('HTTPS://Example.com')).toBe('HTTPS://Example.com')
  })

  it('处理协议相对地址', () => {
    expect(normalizeHttpUrl('//cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
  })
})

describe('isValidHttpUrl', () => {
  it('接受常见有效网址', () => {
    expect(isValidHttpUrl('https://jiang-xia.top')).toBe(true)
    expect(isValidHttpUrl('example.com')).toBe(true)
    expect(isValidHttpUrl('http://localhost:3000')).toBe(true)
  })

  it('拒绝明显无效输入', () => {
    expect(isValidHttpUrl('')).toBe(false)
    expect(isValidHttpUrl('not a url')).toBe(false)
    expect(isValidHttpUrl('ftp://example.com')).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'
import {
  beforeTimeNow,
  formatArchiveDay,
  formatDate,
  formatDateMinute,
  formatRelativeTime,
} from './date-time'

describe('formatDate', () => {
  it('格式化为 YYYY-MM-DD HH:mm:ss', () => {
    expect(formatDate('2024-06-15T08:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })

  it('空值返回空字符串', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('formatArchiveDay', () => {
  it('格式化为 MM-DD', () => {
    expect(formatArchiveDay('2024-06-15T08:30:00.000Z')).toBe('06-15')
  })
})

describe('formatDateMinute', () => {
  it('格式化为 YYYY-MM-DD HH:mm', () => {
    expect(formatDateMinute('2024-06-15T08:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
})

describe('beforeTimeNow', () => {
  it('1 小时前', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T10:00:00.000Z'))
    expect(beforeTimeNow(new Date('2024-06-15T09:00:00.000Z').getTime())).toBe('1小时前')
    vi.useRealTimers()
  })

  it('刚刚', () => {
    const now = Date.now()
    expect(beforeTimeNow(now)).toBe('刚刚')
  })
})

describe('formatRelativeTime', () => {
  it('有效时间返回相对文案', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T10:00:00.000Z'))
    expect(formatRelativeTime('2024-06-15T09:30:00.000Z')).toBe('30分钟前')
    vi.useRealTimers()
  })
})

/**
 * toast 单元测试（延时由 fake timers 控制）
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast, toastSuccess } from './toast'

describe('toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('默认 delay 50ms 后调用 uni.showToast，icon 默认 none', () => {
    toast('验证码错误')
    expect(uni.showToast).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '验证码错误',
      icon: 'none',
    })
  })

  it('支持自定义 duration / delay', () => {
    toastSuccess('已保存', { duration: 2000, delay: 0 })
    vi.advanceTimersByTime(0)
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '已保存',
      icon: 'success',
      duration: 2000,
    })
  })

  it('toastSuccess 使用 success icon', () => {
    toastSuccess('登录成功')
    vi.advanceTimersByTime(50)
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '登录成功',
      icon: 'success',
    })
  })
})

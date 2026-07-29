import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetGlobalLoadingForTest,
  beginGlobalLoading,
  endGlobalLoading,
  setGlobalLoadingOptions,
} from './global-loading'

describe('global-loading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    __resetGlobalLoadingForTest()
    vi.clearAllMocks()
  })

  afterEach(() => {
    __resetGlobalLoadingForTest()
    vi.useRealTimers()
  })

  it('短于 debounce 结束则不展示 Loading', () => {
    beginGlobalLoading()
    vi.advanceTimersByTime(100)
    endGlobalLoading()
    expect(uni.showLoading).not.toHaveBeenCalled()
    expect(uni.hideLoading).not.toHaveBeenCalled()
  })

  it('超过 debounce 才 showLoading，end 时 hideLoading', () => {
    beginGlobalLoading()
    vi.advanceTimersByTime(150)
    expect(uni.showLoading).toHaveBeenCalledWith({
      title: '加载中...',
      mask: true,
    })
    endGlobalLoading()
    expect(uni.hideLoading).toHaveBeenCalled()
  })

  it('并发请求只展示一次，全部结束后才关闭', () => {
    beginGlobalLoading()
    beginGlobalLoading()
    vi.advanceTimersByTime(150)
    expect(uni.showLoading).toHaveBeenCalledTimes(1)
    endGlobalLoading()
    expect(uni.hideLoading).not.toHaveBeenCalled()
    endGlobalLoading()
    expect(uni.hideLoading).toHaveBeenCalledTimes(1)
  })

  it('loading: false 不参与计数', () => {
    beginGlobalLoading(false)
    vi.advanceTimersByTime(200)
    endGlobalLoading(false)
    expect(uni.showLoading).not.toHaveBeenCalled()
  })

  it('支持单次覆盖 title', () => {
    beginGlobalLoading({ title: '提交中...' })
    vi.advanceTimersByTime(150)
    expect(uni.showLoading).toHaveBeenCalledWith({
      title: '提交中...',
      mask: true,
    })
    endGlobalLoading({ title: '提交中...' })
  })

  it('可关闭全局默认', () => {
    setGlobalLoadingOptions({ enabled: false })
    beginGlobalLoading()
    vi.advanceTimersByTime(200)
    endGlobalLoading()
    expect(uni.showLoading).not.toHaveBeenCalled()
  })
})

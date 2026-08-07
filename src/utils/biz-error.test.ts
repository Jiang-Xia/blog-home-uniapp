import { describe, expect, it, vi } from 'vitest'
import {
  getBizErrorMessage,
  isHttpHandledError,
  markHttpToastShown,
  toastBizError,
} from './biz-error'

describe('getBizErrorMessage', () => {
  it('优先取业务体 msg', () => {
    expect(getBizErrorMessage({ code: 400, msg: '验证码错误' })).toBe('验证码错误')
  })

  it('兼容 message 字段', () => {
    expect(getBizErrorMessage({ code: 400, message: '用户名或密码错误' })).toBe('用户名或密码错误')
  })

  it('从 data 嵌套取文案', () => {
    expect(getBizErrorMessage({ statusCode: 500, data: { message: '服务繁忙' } })).toBe('服务繁忙')
  })

  it('无文案时用 fallback', () => {
    expect(getBizErrorMessage(null, '登录失败')).toBe('登录失败')
    expect(getBizErrorMessage({}, '登录失败')).toBe('登录失败')
  })

  it('支持 Error', () => {
    expect(getBizErrorMessage(new Error('微信授权失败'), '登录失败')).toBe('微信授权失败')
  })
})

describe('isHttpHandledError / markHttpToastShown', () => {
  it('仅识别 http 已 toast 标记', () => {
    expect(isHttpHandledError({ code: 400, msg: '验证码错误' })).toBe(false)
    expect(isHttpHandledError({ errMsg: 'request:fail' })).toBe(false)
    expect(isHttpHandledError(markHttpToastShown({ code: 400, msg: '验证码错误' }))).toBe(true)
    expect(isHttpHandledError(markHttpToastShown({ errMsg: 'request:fail' }))).toBe(true)
  })

  it('本地 Error / 上传 fail 未标记，可再 toast', () => {
    expect(isHttpHandledError(new Error('缺 token'))).toBe(false)
    expect(isHttpHandledError({ errMsg: 'uploadFile:fail' })).toBe(false)
  })
})

describe('toastBizError', () => {
  it('已标记则不再调用 uni.showToast', () => {
    vi.useFakeTimers()
    toastBizError(markHttpToastShown({ code: 400, msg: '验证码错误' }), '登录失败')
    vi.advanceTimersByTime(50)
    expect(uni.showToast).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('未标记则 toast 文案', () => {
    vi.useFakeTimers()
    toastBizError(new Error('微信授权失败'), '登录失败')
    vi.advanceTimersByTime(50)
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '微信授权失败',
      icon: 'none',
    })
    vi.useRealTimers()
  })
})

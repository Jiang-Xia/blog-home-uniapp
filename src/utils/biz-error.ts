/**
 * 业务错误文案提取与 http 已 toast 标记
 * - http 层 reject 时若已弹过 toast，会打上 `__httpToastShown`
 * - 页面 catch 用 `toastBizError`：已标记则跳过，否则 toast 后端/本地文案
 * - 勿再写死「xxx失败」覆盖后端提示
 */
import { toast } from '@/utils/toast'

/** http.ts 已展示错误 toast 时挂在 reject 对象上的标记（不可枚举） */
export const HTTP_TOAST_SHOWN = '__httpToastShown'

/**
 * 标记「http 层已 toast」，供 catch 中 toastBizError 跳过
 * @returns 原 error（便于 `reject(markHttpToastShown(err))`）
 */
export function markHttpToastShown<T>(error: T): T {
  if (error != null && typeof error === 'object') {
    try {
      Object.defineProperty(error, HTTP_TOAST_SHOWN, {
        value: true,
        enumerable: false,
        configurable: true,
      })
    }
    catch {
      ;(error as Record<string, unknown>)[HTTP_TOAST_SHOWN] = true
    }
  }
  return error
}

/** 判断是否已由 `http.ts` / `alova` 弹出过错误 toast */
export function isHttpHandledError(error: unknown): boolean {
  return !!(error && typeof error === 'object' && (error as Record<string, unknown>)[HTTP_TOAST_SHOWN] === true)
}

/**
 * 从 http reject 体或 Error 中取出可读文案
 * @param fallback 无后端文案时的兜底（仅本地异常或 hideErrorToast 场景）
 */
export function getBizErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error == null)
    return fallback
  if (typeof error === 'string')
    return error.trim() || fallback

  if (typeof error === 'object') {
    const e = error as Record<string, unknown>
    const fromBiz = pickMsg(e.msg) || pickMsg(e.message)
    if (fromBiz)
      return fromBiz

    const data = e.data
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>
      const fromData = pickMsg(d.msg) || pickMsg(d.message)
      if (fromData)
        return fromData
    }

    if (error instanceof Error && error.message.trim())
      return error.message.trim()
  }

  return fallback
}

/**
 * catch 中调用：http 已 toast 则跳过；否则用后端文案或 fallback 提示
 * （上传、微信 login 等非 http 封装失败也应走这里，会正常弹出）
 */
export function toastBizError(error: unknown, fallback = '请求失败') {
  if (isHttpHandledError(error))
    return
  toast(getBizErrorMessage(error, fallback))
}

function pickMsg(v: unknown): string {
  return typeof v === 'string' && v.trim() ? v.trim() : ''
}

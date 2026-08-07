/**
 * Toast 提示统一封装
 *
 * 默认延后展示，避免 try 内 toast、finally 里 hideLoading 时
 * 被微信小程序同一原生层关掉（showToast / showLoading 共用）。
 *
 * 业务错误文案优先走 http 层后端 msg；页面本地校验 / 成功提示用本方法。
 */

export type ToastOptions = UniNamespace.ShowToastOptions & {
  /** 延后毫秒，默认 50；传 0 仍走下一事件循环（setTimeout 0） */
  delay?: number
}

/**
 * @param title 提示文案
 * @param options 透传 uni.showToast；默认 icon 为 none
 */
export function toast(title: string, options: ToastOptions = {}) {
  const { delay = 50, ...rest } = options
  const ms = Math.max(0, Number(delay) || 0)
  setTimeout(() => {
    uni.showToast({
      title,
      icon: 'none',
      ...rest,
    })
  }, ms)
}

/** 成功态快捷方法（icon: success） */
export function toastSuccess(title: string, options: Omit<ToastOptions, 'icon'> = {}) {
  toast(title, { ...options, icon: 'success' })
}

/** 错误态快捷方法（icon: none，与 toast 相同，语义更清晰） */
export function toastError(title: string, options: ToastOptions = {}) {
  toast(title, options)
}

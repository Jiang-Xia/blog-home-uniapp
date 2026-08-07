/**
 * RPG 风确认弹窗（uni.showModal 封装，供宠物兑换/公会等 mutation 前确认）
 */
export interface RpgModalOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'neutral' | 'warning'
  type?: 'confirm' | 'alert'
}

export function useRpgModal() {
  const confirm = (options: Omit<RpgModalOptions, 'type'>): Promise<boolean> => {
    return new Promise((resolve) => {
      uni.showModal({
        title: options.title,
        content: options.description || '',
        confirmText: options.confirmLabel || '确定',
        cancelText: options.cancelLabel || '取消',
        success: (res) => {
          resolve(!!res.confirm)
        },
        fail: () => resolve(false),
      })
    })
  }

  const alert = (options: Omit<RpgModalOptions, 'type'>): Promise<boolean> => {
    return new Promise((resolve) => {
      uni.showModal({
        title: options.title,
        content: options.description || '',
        showCancel: false,
        confirmText: options.confirmLabel || '知道了',
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })
  }

  return { confirm, alert }
}

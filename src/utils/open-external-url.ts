/**
 * 在外部浏览器打开 URL（H5）或复制链接（小程序/App）
 */
import { toastSuccess } from '@/utils/toast'

export function openExternalUrl(url: string) {
  if (!url)
    return
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: url,
    success: () => toastSuccess('链接已复制'),
  })
  // #endif
}

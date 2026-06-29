/**
 * 站内通知未读数（全站单例）
 * - 登录后订阅 siteNotification WS 实时更新角标
 * - 挂载时 HTTP 拉一次；断线重连后再拉一次兜底
 */
import { ref, watch } from 'vue'
import { getUnreadCount } from '@/api/notification'
import { onRealtimeEvent, useRealtimeSocketState } from '@/composables/use-realtime-socket'
import { useTokenStore } from '@/store/token'

const unreadCount = ref(0)
let listenersBound = false

function bindListeners() {
  if (listenersBound)
    return
  listenersBound = true

  onRealtimeEvent('siteNotification', (data: any) => {
    if (typeof data?.unreadCount === 'number')
      unreadCount.value = data.unreadCount
    else
      unreadCount.value += 1
  })
}

export function useSiteNotification() {
  const tokenStore = useTokenStore()
  const { connected } = useRealtimeSocketState()

  const fetchUnread = async () => {
    if (!tokenStore.hasLogin)
      return
    try {
      unreadCount.value = (await getUnreadCount())?.count ?? 0
    }
    catch {
      unreadCount.value = 0
    }
  }

  bindListeners()

  watch(
    () => tokenStore.hasLogin,
    (loggedIn) => {
      if (loggedIn)
        void fetchUnread()
      else
        unreadCount.value = 0
    },
    { immediate: true },
  )

  watch(connected, (isConnected, wasConnected) => {
    if (isConnected && wasConnected === false && tokenStore.hasLogin)
      void fetchUnread()
  })

  const resetUnread = () => {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    fetchUnread,
    resetUnread,
  }
}

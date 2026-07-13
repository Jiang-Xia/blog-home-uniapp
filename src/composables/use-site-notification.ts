/**
 * 站内通知未读数（全站单例）
 * - 登录后订阅 siteNotification WS 实时更新角标
 * - 挂载时 HTTP 拉一次；断线重连后再拉一次兜底
 * - watcher 仅注册一次，避免各 Tab 页 layout 重复挂载时多次请求 /notification/unread-count
 */
import { ref, watch } from 'vue'
import { getUnreadCount } from '@/api/notification'
import { onRealtimeEvent, useRealtimeSocketState } from '@/composables/use-realtime-socket'
import { useTokenStore } from '@/store/token'

const unreadCount = ref(0)
let listenersBound = false
let watchersBound = false
let fetchInflight: Promise<void> | null = null

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

/** HTTP 拉取未读数；并发调用合并为单次请求 */
async function fetchUnread() {
  const tokenStore = useTokenStore()
  if (!tokenStore.hasLogin)
    return
  if (fetchInflight)
    return fetchInflight

  fetchInflight = (async () => {
    try {
      unreadCount.value = (await getUnreadCount())?.count ?? 0
    }
    catch {
      unreadCount.value = 0
    }
    finally {
      fetchInflight = null
    }
  })()

  return fetchInflight
}

function bindWatchers() {
  if (watchersBound)
    return
  watchersBound = true

  bindListeners()

  const tokenStore = useTokenStore()
  const { connected } = useRealtimeSocketState()

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
}

export function useSiteNotification() {
  bindWatchers()

  const resetUnread = () => {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    fetchUnread,
    resetUnread,
  }
}

import {
  connectRealtimeSocket,
  disconnectRealtimeSocket,
  notifyDataRefresh,
  onDataRefresh,
  onRealtimeEvent,

} from '@/composables/use-realtime-socket'
import type { RpgRefreshScope } from '@/composables/use-realtime-socket'

const refreshCallbacks = new Map<RpgRefreshScope, Set<() => void>>()

export function registerRpgRefresh(scope: RpgRefreshScope, fn: () => void) {
  if (!refreshCallbacks.has(scope))
    refreshCallbacks.set(scope, new Set())
  refreshCallbacks.get(scope)!.add(fn)
  return () => refreshCallbacks.get(scope)?.delete(fn)
}

function triggerScope(scope: RpgRefreshScope) {
  refreshCallbacks.get(scope)?.forEach(fn => fn())
}

/** RPG 实时事件处理（简化版，Toast + 增量刷新） */
export function initRpgRealtimeHandlers() {
  connectRealtimeSocket()

  onDataRefresh((scope) => {
    triggerScope(scope)
  })

  const refreshOn = (scopes: RpgRefreshScope[], event: Parameters<typeof onRealtimeEvent>[0]) => {
    onRealtimeEvent(event, () => {
      scopes.forEach(s => notifyDataRefresh(s))
    })
  }

  refreshOn(['status'], 'levelUp')
  refreshOn(['status'], 'lifeChange')
  refreshOn(['status'], 'currencyChange')
  refreshOn(['status', 'quests'], 'questComplete')
  refreshOn(['status', 'quests'], 'questReward')
  refreshOn(['status', 'achievements'], 'achievementComplete')
  refreshOn(['inventory', 'status'], 'itemGranted')
  refreshOn(['pets'], 'petHatched')
  refreshOn(['guild'], 'guildEvent')
  refreshOn(['leaderboard'], 'rankChange')
  refreshOn(['status'], 'rechargeComplete')

  onRealtimeEvent('levelUp', () => {
    uni.showToast({ title: '升级了！', icon: 'success' })
  })
  onRealtimeEvent('rechargeComplete', (data: any) => {
    uni.showToast({ title: `充值成功 +${data?.diamonds ?? 0} 钻`, icon: 'success' })
  })
  onRealtimeEvent('siteNotification', () => {
    triggerScope('status')
  })

  return disconnectRealtimeSocket
}

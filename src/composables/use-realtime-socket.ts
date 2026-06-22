/**
 * Socket.IO 实时通道（对齐 blog-home-nuxt composables/use-realtime-socket）
 * - 连接 ${wsOrigin}/realtime，Bearer 鉴权
 * - RPG 事件分发与 dataRefresh 通知
 */
import { ref } from 'vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { useTokenStore } from '@/store/token'
import { getWsOrigin } from '@/utils/ws-origin'

export type RealtimeSocketEvent
  = | 'levelUp'
    | 'lifeChange'
    | 'banStatus'
    | 'achievementComplete'
    | 'questReward'
    | 'buffGranted'
    | 'questComplete'
    | 'expGain'
    | 'socialReceived'
    | 'tipReceived'
    | 'articleLevelUp'
    | 'masterpiece'
    | 'currencyChange'
    | 'rechargeComplete'
    | 'itemGranted'
    | 'lotteryTicketChange'
    | 'petHatched'
    | 'shieldUsed'
    | 'weatherBuff'
    | 'activityUpdate'
    | 'rankChange'
    | 'guildEvent'
    | 'buffExpired'
    | 'siteNotification'

export type RpgRefreshScope
  = | 'status'
    | 'achievements'
    | 'quests'
    | 'buffs'
    | 'inventory'
    | 'pets'
    | 'guild'
    | 'leaderboard'

type RealtimeSocketListener = (data: unknown) => void
type RpgRefreshHandler = (scope: RpgRefreshScope) => void

const ALL_EVENTS: RealtimeSocketEvent[] = [
  'levelUp',
  'lifeChange',
  'banStatus',
  'achievementComplete',
  'questReward',
  'buffGranted',
  'questComplete',
  'expGain',
  'socialReceived',
  'tipReceived',
  'articleLevelUp',
  'masterpiece',
  'currencyChange',
  'rechargeComplete',
  'itemGranted',
  'lotteryTicketChange',
  'petHatched',
  'shieldUsed',
  'weatherBuff',
  'activityUpdate',
  'rankChange',
  'guildEvent',
  'buffExpired',
  'siteNotification',
]

let socket: Socket | null = null
const connected = ref(false)
const refreshHandlers = new Set<RpgRefreshHandler>()
const listeners = Object.fromEntries(
  ALL_EVENTS.map(e => [e, new Set<RealtimeSocketListener>()]),
) as Record<RealtimeSocketEvent, Set<RealtimeSocketListener>>

function emitToListeners(event: RealtimeSocketEvent, data: unknown) {
  listeners[event].forEach(fn => fn(data))
}

/** 通知 RPG 各 scope 刷新（mutation 后由 handler 调用） */
export function notifyDataRefresh(scope: RpgRefreshScope) {
  refreshHandlers.forEach(fn => fn(scope))
}

/** 订阅单个 realtime 事件；返回取消函数 */
export function onRealtimeEvent(event: RealtimeSocketEvent, handler: RealtimeSocketListener) {
  listeners[event].add(handler)
  return () => listeners[event].delete(handler)
}

/** 订阅 RPG 数据刷新 scope */
export function onDataRefresh(handler: RpgRefreshHandler) {
  refreshHandlers.add(handler)
  return () => refreshHandlers.delete(handler)
}

function buildAuthToken() {
  const tokenStore = useTokenStore()
  const token = tokenStore.updateNowTime().validToken
  return token ? `Bearer ${token}` : ''
}

/** 建立 Socket.IO 连接（已连接或无 token 时跳过） */
export function connectRealtimeSocket() {
  if (socket?.connected)
    return
  const authToken = buildAuthToken()
  if (!authToken)
    return

  const newSocket = io(`${getWsOrigin()}/realtime`, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  })

  newSocket.on('connect', () => {
    connected.value = true
  })
  newSocket.on('disconnect', () => {
    connected.value = false
  })
  ALL_EVENTS.forEach((event) => {
    newSocket.on(event, data => emitToListeners(event, data))
  })
  socket = newSocket
}

/** 断开 Socket.IO 并清理单例 */
export function disconnectRealtimeSocket() {
  socket?.disconnect()
  socket = null
  connected.value = false
}

/** 读取连接状态 ref（供 UI 展示） */
export function useRealtimeSocketState() {
  return { connected }
}

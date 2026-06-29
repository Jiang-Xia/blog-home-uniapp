/**
 * Socket.IO 实时通道（对齐 blog-home-nuxt composables/use-realtime-socket）
 * - 连接 ${wsOrigin}/realtime，Bearer 鉴权
 * - RPG 事件分发与 dataRefresh 通知
 * - 小程序/APP 使用 @hyoga/uni-socket.io（uni.connectSocket），H5 仍走原生 WebSocket
 */
import { isH5 } from '@uni-helper/uni-env'
import io from '@hyoga/uni-socket.io'
import { ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { useTokenStore } from '@/store/token'
import { getWsOrigin } from '@/utils/ws-origin'
import { canUseRpgDevMock } from '@/utils/rpg-dev-mock-guard'

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

/** 小程序/APP 仅支持 WebSocket；H5 可降级 polling */
function getSocketTransports(): ('websocket' | 'polling')[] {
  return isH5 ? ['websocket', 'polling'] : ['websocket']
}

const WS_LOG_PREFIX = '[realtime-ws]'

/** 建立 Socket.IO 连接（已连接或无 token 时跳过） */
export function connectRealtimeSocket() {
  if (socket?.connected) {
    console.log(WS_LOG_PREFIX, '已连接，跳过重复初始化', { id: socket.id })
    return
  }
  const authToken = buildAuthToken()
  if (!authToken) {
    console.warn(WS_LOG_PREFIX, '未登录或无 token，跳过 WS 初始化')
    return
  }

  const url = `${getWsOrigin()}/realtime`
  const transports = getSocketTransports()
  console.log(WS_LOG_PREFIX, '开始初始化', { url, transports })

  const newSocket = io(url, {
    auth: { token: authToken },
    transports,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  })

  newSocket.io.on('reconnect_attempt', (attempt) => {
    console.log(WS_LOG_PREFIX, '重连中', { attempt })
    const freshToken = buildAuthToken()
    if (freshToken)
      newSocket.auth = { token: freshToken }
  })

  newSocket.io.on('reconnect', () => {
    console.log(WS_LOG_PREFIX, '重连成功', { id: newSocket.id })
  })

  newSocket.on('connect', () => {
    connected.value = true
    console.log(WS_LOG_PREFIX, '连接成功', { id: newSocket.id, url })
  })
  newSocket.on('disconnect', (reason) => {
    connected.value = false
    console.warn(WS_LOG_PREFIX, '连接断开', { reason })
  })
  newSocket.on('connect_error', (err) => {
    connected.value = false
    console.error(WS_LOG_PREFIX, '连接失败', err?.message || err)
  })
  ALL_EVENTS.forEach((event) => {
    newSocket.on(event, data => emitToListeners(event, data))
  })
  socket = newSocket
}

/** 断开 Socket.IO 并清理单例 */
export function disconnectRealtimeSocket() {
  if (socket) {
    console.log(WS_LOG_PREFIX, '主动断开')
    socket.disconnect()
  }
  socket = null
  connected.value = false
}

/** 开发/测试页：本地注入 WS 事件，走与真推送相同的 onRealtimeEvent 监听链 */
export function dispatchLocalEvent(event: RealtimeSocketEvent, data: unknown) {
  if (!canUseRpgDevMock())
    return
  emitToListeners(event, data)
}

/** 读取连接状态 ref（供 UI 展示） */
export function useRealtimeSocketState() {
  return { connected }
}

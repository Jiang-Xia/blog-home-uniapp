/**
 * 博客实时 WebSocket（对齐 blog-home-nuxt composables/use-realtime-socket）
 * - 默认原生 WS GET /realtime?token=…（blog-server-go）
 * - VITE_USE_SOCKET_IO=true 时回退 Socket.IO（Nest）
 * - H5 用浏览器 WebSocket；小程序/APP 用 uni.connectSocket
 */
import { isH5 } from '@uni-helper/uni-env'
import io from '@hyoga/uni-socket.io'
import { ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { getNotificationsSince } from '@/api/notification'
import { useTokenStore } from '@/store/token'
import { canUseRpgDevMock } from '@/utils/rpg-dev-mock-guard'
import { createNativeWs, WS_OPEN } from '@/utils/native-ws'
import type { NativeWsConnection } from '@/utils/native-ws'
import { getWsOrigin } from '@/utils/ws-origin'

/** true 时回退 Socket.IO（Nest）；默认原生 WebSocket（blog-server-go） */
const useSocketIO = import.meta.env.VITE_USE_SOCKET_IO === 'true'

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
let nativeWs: NativeWsConnection | null = null
const connected = ref(false)
const refreshHandlers = new Set<RpgRefreshHandler>()
const listeners = Object.fromEntries(
  ALL_EVENTS.map(e => [e, new Set<RealtimeSocketListener>()]),
) as Record<RealtimeSocketEvent, Set<RealtimeSocketListener>>

let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let heartbeatTimer: ReturnType<typeof setInterval> | undefined
let reconnectAttempts = 0
let lastSeq = 0
let currentWsURL = ''

const WS_LOG_PREFIX = '[realtime-ws]'

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

function getRawToken() {
  const tokenStore = useTokenStore()
  return tokenStore.updateNowTime().validToken
}

function buildAuthToken() {
  const token = getRawToken()
  return token ? `Bearer ${token}` : ''
}

function buildWsURL() {
  const raw = getRawToken()
  if (!raw)
    return ''
  const wsOrigin = getWsOrigin().replace(/^http/i, 'ws')
  return `${wsOrigin}/realtime?token=${encodeURIComponent(raw)}`
}

function routeNativeMessage(msg: { type?: string, seq?: number, data?: unknown }) {
  if (!msg.type || msg.type === 'pong')
    return
  if (typeof msg.seq === 'number' && msg.seq > 0)
    lastSeq = Math.max(lastSeq, msg.seq)
  if (!ALL_EVENTS.includes(msg.type as RealtimeSocketEvent))
    return
  let data = msg.data
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    }
    catch {
      return
    }
  }
  emitToListeners(msg.type as RealtimeSocketEvent, data)
}

async function replayNotificationsSince() {
  if (lastSeq <= 0)
    return
  try {
    const list = await getNotificationsSince(lastSeq)
    if (!Array.isArray(list))
      return
    for (const item of list) {
      lastSeq = Math.max(lastSeq, item.id)
      emitToListeners('siteNotification', {
        notification: {
          id: item.id,
          type: item.type,
          payload: item.payload,
          read: item.read === 1,
          createTime: item.createTime,
        },
      })
    }
  }
  catch {
    // 补漏失败不阻断 WS
  }
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = undefined
  }
}

function startNativeHeartbeat(ws: NativeWsConnection) {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (ws.getReadyState() === WS_OPEN)
      ws.send(JSON.stringify({ type: 'ping' }))
  }, 20000)
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = undefined
  }
}

function scheduleReconnect() {
  if (reconnectTimer)
    clearTimeout(reconnectTimer)
  const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000)
  const jitter = Math.random() * 1000
  reconnectTimer = setTimeout(() => {
    reconnectAttempts += 1
    connectRealtimeSocket()
  }, delay + jitter)
}

function disconnectNative() {
  clearReconnectTimer()
  stopHeartbeat()
  if (nativeWs) {
    nativeWs.close()
    nativeWs = null
  }
  currentWsURL = ''
}

function connectNative() {
  const url = buildWsURL()
  if (!url) {
    console.warn(WS_LOG_PREFIX, '未登录或无 token，跳过原生 WS 初始化')
    disconnectNative()
    connected.value = false
    return
  }

  if (nativeWs && nativeWs.getReadyState() === WS_OPEN && currentWsURL === url) {
    console.log(WS_LOG_PREFIX, '原生 WS 已连接，跳过重复初始化')
    return
  }

  disconnectNative()
  console.log(WS_LOG_PREFIX, '开始初始化原生 WS', { url: url.replace(/token=[^&]+/, 'token=***') })

  currentWsURL = url
  nativeWs = createNativeWs(url, {
    onOpen: () => {
      connected.value = true
      reconnectAttempts = 0
      console.log(WS_LOG_PREFIX, '原生 WS 连接成功')
      if (nativeWs)
        startNativeHeartbeat(nativeWs)
      void replayNotificationsSince()
    },
    onMessage: (raw) => {
      try {
        routeNativeMessage(JSON.parse(raw))
      }
      catch {
        // ignore malformed
      }
    },
    onClose: () => {
      connected.value = false
      stopHeartbeat()
      nativeWs = null
      console.warn(WS_LOG_PREFIX, '原生 WS 连接断开')
      if (getRawToken())
        scheduleReconnect()
    },
    onError: () => {
      connected.value = false
      console.error(WS_LOG_PREFIX, '原生 WS 连接失败')
    },
  })
}

/** 小程序/APP 仅支持 WebSocket；H5 可降级 polling */
function getSocketTransports(): ('websocket' | 'polling')[] {
  return isH5 ? ['websocket', 'polling'] : ['websocket']
}

function disconnectSocketIO() {
  if (socket) {
    console.log(WS_LOG_PREFIX, '主动断开 Socket.IO')
    socket.disconnect()
  }
  socket = null
}

/** 建立 Socket.IO 连接（已连接或无 token 时跳过） */
function connectSocketIO() {
  if (socket?.connected) {
    console.log(WS_LOG_PREFIX, 'Socket.IO 已连接，跳过重复初始化', { id: socket.id })
    return
  }
  const authToken = buildAuthToken()
  if (!authToken) {
    console.warn(WS_LOG_PREFIX, '未登录或无 token，跳过 Socket.IO 初始化')
    disconnectSocketIO()
    connected.value = false
    return
  }

  const url = `${getWsOrigin()}/realtime`
  const transports = getSocketTransports()
  console.log(WS_LOG_PREFIX, '开始初始化 Socket.IO', { url, transports })

  const newSocket = io(url, {
    auth: { token: authToken },
    transports,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  })

  newSocket.io.on('reconnect_attempt', (attempt) => {
    console.log(WS_LOG_PREFIX, 'Socket.IO 重连中', { attempt })
    const freshToken = buildAuthToken()
    if (freshToken)
      newSocket.auth = { token: freshToken }
  })

  newSocket.io.on('reconnect', () => {
    console.log(WS_LOG_PREFIX, 'Socket.IO 重连成功', { id: newSocket.id })
  })

  newSocket.on('connect', () => {
    connected.value = true
    console.log(WS_LOG_PREFIX, 'Socket.IO 连接成功', { id: newSocket.id, url })
  })
  newSocket.on('disconnect', (reason) => {
    connected.value = false
    console.warn(WS_LOG_PREFIX, 'Socket.IO 连接断开', { reason })
  })
  newSocket.on('connect_error', (err) => {
    connected.value = false
    console.error(WS_LOG_PREFIX, 'Socket.IO 连接失败', err?.message || err)
  })
  ALL_EVENTS.forEach((event) => {
    newSocket.on(event, data => emitToListeners(event, data))
  })
  socket = newSocket
}

/** 建立 /realtime 连接；未登录（无 token）时不连接 */
export function connectRealtimeSocket() {
  if (useSocketIO)
    connectSocketIO()
  else
    connectNative()
}

/** 断开实时连接并清理单例 */
export function disconnectRealtimeSocket() {
  disconnectNative()
  disconnectSocketIO()
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

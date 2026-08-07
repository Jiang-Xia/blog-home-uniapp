/**
 * 跨端原生 WebSocket 薄封装
 * - H5：浏览器 WebSocket
 * - 小程序/APP：uni.connectSocket
 */
import { isH5 } from '@uni-helper/uni-env'

export const WS_CONNECTING = 0
export const WS_OPEN = 1
export const WS_CLOSING = 2
export const WS_CLOSED = 3

export interface NativeWsCallbacks {
  onOpen?: () => void
  onMessage?: (data: string) => void
  onClose?: () => void
  onError?: () => void
}

export interface NativeWsConnection {
  send: (data: string) => void
  close: () => void
  getReadyState: () => number
}

/** 创建原生 WebSocket 连接（H5 / 小程序 / APP） */
export function createNativeWs(url: string, callbacks: NativeWsCallbacks): NativeWsConnection {
  if (isH5 && typeof WebSocket !== 'undefined') {
    const ws = new WebSocket(url)
    ws.onopen = () => callbacks.onOpen?.()
    ws.onmessage = (e) => {
      callbacks.onMessage?.(String(e.data))
    }
    ws.onclose = () => callbacks.onClose?.()
    ws.onerror = () => {
      callbacks.onError?.()
      ws.close()
    }
    return {
      send: (data) => {
        if (ws.readyState === WebSocket.OPEN)
          ws.send(data)
      },
      close: () => ws.close(),
      getReadyState: () => ws.readyState,
    }
  }

  let readyState = WS_CONNECTING
  const task = uni.connectSocket({ url, complete: () => {} })
  task.onOpen(() => {
    readyState = WS_OPEN
    callbacks.onOpen?.()
  })
  task.onMessage((res) => {
    callbacks.onMessage?.(typeof res.data === 'string' ? res.data : String(res.data))
  })
  task.onClose(() => {
    readyState = WS_CLOSED
    callbacks.onClose?.()
  })
  task.onError(() => {
    callbacks.onError?.()
    task.close({})
  })
  return {
    send: (data) => {
      if (readyState === WS_OPEN)
        task.send({ data })
    },
    close: () => {
      readyState = WS_CLOSING
      task.close({})
    },
    getReadyState: () => readyState,
  }
}

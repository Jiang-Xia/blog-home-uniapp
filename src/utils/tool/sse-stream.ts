/**
 * SSE 流式请求封装：H5 用 fetch ReadableStream，微信小程序用 enableChunked。
 */

export interface SseStreamOptions {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
  /** 收到 data: 行内容（已去掉前缀） */
  onMessage: (data: string) => void
  onError?: (message: string) => void
  onDone?: () => void
}

let sseBuffer = ''

/** 解析 SSE 文本块，按行回调 onMessage */
function feedSseChunk(text: string, onMessage: (data: string) => void, onDone?: () => void) {
  sseBuffer += text
  const lines = sseBuffer.split('\n')
  sseBuffer = lines.pop() ?? ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:'))
      continue
    const data = trimmed.slice(5).trim()
    if (data === '[DONE]') {
      onDone?.()
      continue
    }
    if (data)
      onMessage(data)
  }
}

/** 发起 SSE 流式 POST/GET，返回 abort 函数 */
export function startSseStream(options: SseStreamOptions): () => void {
  sseBuffer = ''
  let aborted = false

  // #ifdef H5
  const controller = new AbortController()
  void (async () => {
    try {
      const res = await fetch(options.url, {
        method: options.method ?? 'POST',
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      })
      if (!res.ok) {
        options.onError?.(`请求失败 (${res.status})`)
        return
      }
      if (!res.body) {
        options.onError?.('响应不支持流式读取')
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        if (aborted)
          break
        const { done, value } = await reader.read()
        if (done)
          break
        feedSseChunk(decoder.decode(value, { stream: true }), options.onMessage, options.onDone)
      }
      options.onDone?.()
    }
    catch (e: any) {
      if (!aborted)
        options.onError?.(e?.message || '流式请求失败')
    }
  })()
  return () => {
    aborted = true
    controller.abort()
  }
  // #endif

  // #ifndef H5
  const task = uni.request({
    url: options.url,
    method: options.method ?? 'POST',
    header: options.headers,
    data: options.body ? JSON.parse(options.body) : undefined,
    enableChunked: true,
    responseType: 'arraybuffer',
    success: (res) => {
      if (res.statusCode && res.statusCode >= 400)
        options.onError?.(`请求失败 (${res.statusCode})`)
    },
    fail: (err) => {
      if (!aborted)
        options.onError?.(err.errMsg || '流式请求失败')
    },
  }) as UniApp.RequestTask & { onChunkReceived?: (cb: (res: { data: ArrayBuffer }) => void) => void }

  task.onChunkReceived?.((res) => {
    if (aborted)
      return
    const text = arrayBufferToUtf8(res.data)
    feedSseChunk(text, options.onMessage, options.onDone)
  })

  return () => {
    aborted = true
    task.abort?.()
  }
  // #endif
}

function arrayBufferToUtf8(buffer: ArrayBuffer): string {
  // #ifdef MP-WEIXIN
  const TextDecoderPoly = typeof TextDecoder !== 'undefined' ? TextDecoder : null
  if (TextDecoderPoly) {
    return new TextDecoderPoly('utf-8').decode(buffer)
  }
  // #endif
  const bytes = new Uint8Array(buffer)
  let out = ''
  for (let i = 0; i < bytes.length; i++)
    out += String.fromCharCode(bytes[i]!)
  try {
    return decodeURIComponent(escape(out))
  }
  catch {
    return out
  }
}

/** 从 SSE JSON 片段提取 delta content */
export function parseSseDeltaContent(data: string): string {
  try {
    const chunk = JSON.parse(data)
    return chunk?.choices?.[0]?.delta?.content ?? ''
  }
  catch {
    return ''
  }
}

/** 从 SSE JSON 片段提取 delta reasoning_content */
export function parseSseDeltaReasoning(data: string): string {
  try {
    const chunk = JSON.parse(data)
    return chunk?.choices?.[0]?.delta?.reasoning_content ?? ''
  }
  catch {
    return ''
  }
}

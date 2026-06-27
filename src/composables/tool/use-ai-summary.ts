/**
 * AI 文章摘要 composable — 对齐 blog-home-nuxt/pages/tool/ai-summary/index.vue
 */
import { aesDecrypt } from '@/utils/crypto'
import { parseSseDeltaContent, startSseStream } from '@/utils/tool/sse-stream'

export type SummaryStyle = 'concise' | 'detailed' | 'technical' | 'casual'
export type SummaryLength = 'short' | 'medium' | 'long'

export interface SummaryHistoryItem {
  summary: string
  style: SummaryStyle
  length: SummaryLength
  timestamp: number
  originalLength: number
}

export const MAX_CONTENT_CHARS = 8000
export const MIN_CONTENT_CHARS = 100
const HISTORY_STORAGE_KEY = 'ai-summary-history'

export const styleLabels: Record<SummaryStyle, string> = {
  concise: '简洁型',
  detailed: '详细型',
  technical: '技术型',
  casual: '轻松型',
}

export const lengthLabels: Record<SummaryLength, string> = {
  short: '短摘要 (50字)',
  medium: '中摘要 (100字)',
  long: '长摘要 (200字)',
}

const stylePrompts: Record<SummaryStyle, string> = {
  concise: '简洁明了，突出核心要点',
  detailed: '详细完整，包含主要论点和支撑信息',
  technical: '专业术语准确，突出技术细节',
  casual: '轻松易懂，使用日常语言表达',
}

const lengthPrompts: Record<SummaryLength, string> = {
  short: '50字以内',
  medium: '100字左右',
  long: '200字左右',
}

/** AI 摘要状态与流式生成 */
export function useAiSummary() {
  const nuxtHome = import.meta.env.VITE_NUXT_HOME_URL || 'http://localhost:5050'
  const originalText = ref('')
  const summary = ref('')
  const loading = ref(false)
  const serviceConfigured = ref<boolean | null>(null)
  const summaryStyle = ref<SummaryStyle>('concise')
  const summaryLength = ref<SummaryLength>('medium')
  const summaryHistory = ref<SummaryHistoryItem[]>([])

  let abortStream: (() => void) | null = null

  const canGenerate = computed(() => {
    const len = originalText.value.trim().length
    return len >= MIN_CONTENT_CHARS && len <= MAX_CONTENT_CHARS && serviceConfigured.value !== false
  })

  const wordCountClass = computed(() => {
    const len = originalText.value.length
    if (len > MAX_CONTENT_CHARS)
      return 'text-error'
    if (len > 0 && len < MIN_CONTENT_CHARS)
      return 'text-warning'
    return 'text-tech-subtle'
  })

  function buildPrompt() {
    return `请为以下文章生成摘要：

要求：
- 风格：${stylePrompts[summaryStyle.value]}
- 长度：${lengthPrompts[summaryLength.value]}
- 保持客观中性，突出主要观点
- 使用中文输出

文章内容：
${originalText.value}

请直接输出摘要内容，不要包含其他说明文字。`
  }

  function persistHistory() {
    uni.setStorageSync(HISTORY_STORAGE_KEY, JSON.stringify(summaryHistory.value))
  }

  function loadHistoryFromStorage() {
    try {
      const raw = uni.getStorageSync(HISTORY_STORAGE_KEY)
      if (!raw)
        return
      const parsed = JSON.parse(String(raw)) as SummaryHistoryItem[]
      if (Array.isArray(parsed))
        summaryHistory.value = parsed.slice(0, 10)
    }
    catch {
      uni.removeStorageSync(HISTORY_STORAGE_KEY)
    }
  }

  function appendHistoryItem() {
    if (!summary.value.trim())
      return
    summaryHistory.value.unshift({
      summary: summary.value,
      style: summaryStyle.value,
      length: summaryLength.value,
      timestamp: Date.now(),
      originalLength: originalText.value.length,
    })
    if (summaryHistory.value.length > 10)
      summaryHistory.value = summaryHistory.value.slice(0, 10)
    persistHistory()
  }

  async function checkServiceStatus() {
    try {
      const res = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
        uni.request({
          url: `${nuxtHome}/api/ai-summary-status`,
          success: resolve,
          fail: reject,
        })
      })
      const data = res.data as { configured?: boolean }
      serviceConfigured.value = !!data?.configured
    }
    catch {
      serviceConfigured.value = null
    }
  }

  function closeActiveStream() {
    abortStream?.()
    abortStream = null
  }

  function generateSummary() {
    if (!originalText.value.trim()) {
      uni.showToast({ title: '请输入文章内容', icon: 'none' })
      return
    }
    if (originalText.value.length < MIN_CONTENT_CHARS) {
      uni.showToast({ title: `建议至少 ${MIN_CONTENT_CHARS} 字`, icon: 'none' })
      return
    }
    if (originalText.value.length > MAX_CONTENT_CHARS) {
      uni.showToast({ title: `请控制在 ${MAX_CONTENT_CHARS} 字以内`, icon: 'none' })
      return
    }

    closeActiveStream()
    loading.value = true
    summary.value = ''

    const payload = {
      messages: [{ role: 'user', content: buildPrompt() }],
      model: 'deepseek-chat',
    }

    abortStream = startSseStream({
      url: `${nuxtHome}/api/ai-summary-stream`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      onMessage: (data) => {
        const delta = parseSseDeltaContent(data)
        if (delta)
          summary.value += delta
      },
      onError: (msg) => {
        loading.value = false
        if (!summary.value.trim())
          uni.showToast({ title: msg, icon: 'none' })
      },
      onDone: () => {
        loading.value = false
        appendHistoryItem()
        closeActiveStream()
      },
    })
  }

  function loadFromHistory(item: SummaryHistoryItem) {
    summary.value = item.summary
    summaryStyle.value = item.style
    summaryLength.value = item.length
  }

  function clearHistory() {
    summaryHistory.value = []
    persistHistory()
    uni.showToast({ title: '历史已清空', icon: 'success' })
  }

  function clearOriginal() {
    originalText.value = ''
  }

  function copySummary() {
    uni.setClipboardData({
      data: summary.value,
      success: () => uni.showToast({ title: '已复制', icon: 'success' }),
    })
  }

  function exportAsMarkdown() {
    const markdown = `# 文章摘要

**摘要风格**: ${styleLabels[summaryStyle.value]}
**摘要长度**: ${lengthLabels[summaryLength.value]}
**生成时间**: ${new Date().toLocaleString()}

## 摘要内容

${summary.value}

## 原文信息

- 原文字数: ${originalText.value.length}
- 压缩比例: ${originalText.value.length ? Math.round((summary.value.length / originalText.value.length) * 100) : 0}%
`
    // #ifdef H5
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `文章摘要_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: '已导出', icon: 'success' })
    // #endif
    // #ifndef H5
    uni.setClipboardData({
      data: markdown,
      success: () => uni.showToast({ title: 'Markdown 已复制', icon: 'success' }),
    })
    // #endif
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function loadPrefillFromRoute() {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1] as any
    const raw = page?.options?.params
    if (!raw)
      return
    try {
      const params = JSON.parse(aesDecrypt(decodeURIComponent(raw)))
      if (typeof params?.content === 'string')
        originalText.value = params.content
    }
    catch {
      uni.showToast({ title: '预填参数解析失败', icon: 'none' })
    }
  }

  onMounted(() => {
    loadHistoryFromStorage()
    loadPrefillFromRoute()
    void checkServiceStatus()
  })

  onUnmounted(() => {
    closeActiveStream()
  })

  return {
    nuxtHome,
    originalText,
    summary,
    loading,
    serviceConfigured,
    summaryStyle,
    summaryLength,
    summaryHistory,
    styleLabels,
    lengthLabels,
    canGenerate,
    wordCountClass,
    generateSummary,
    loadFromHistory,
    clearHistory,
    clearOriginal,
    copySummary,
    exportAsMarkdown,
    formatDate,
    MAX_CONTENT_CHARS,
    MIN_CONTENT_CHARS,
  }
}

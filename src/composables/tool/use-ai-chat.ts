/**
 * AI 对话 composable — 对齐 blog-home-nuxt/pages/tool/ai/index.vue
 */
import { getEnvBaseUrl } from '@/utils'
import { parseSseDeltaContent, parseSseDeltaReasoning, startSseStream } from '@/utils/tool/sse-stream'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  reasoning_content?: string
}

/** AI 流式对话 */
export function useAiChat() {
  const modelList = [
    { value: 'deepseek-reasoner', label: 'deepseek-reasoner' },
    { value: 'deepseek-chat', label: 'deepseek-chat' },
  ] as const

  const chatList = ref<ChatMessage[]>([])
  const inputText = ref('你好，给我讲个冷笑话~')
  const baseURL = ref('https://api.deepseek.com')
  const model = ref<'deepseek-reasoner' | 'deepseek-chat'>('deepseek-reasoner')
  const apiKey = ref('')
  const loading = ref(false)

  let abortStream: (() => void) | null = null

  function sendMessage() {
    if (!apiKey.value || !baseURL.value || !model.value) {
      uni.showToast({ title: '请输入完整参数', icon: 'none' })
      return
    }
    if (!inputText.value.trim()) {
      uni.showToast({ title: '请输入问题', icon: 'none' })
      return
    }

    chatList.value.push({ role: 'user', content: inputText.value })
    inputText.value = ''

    const messages = chatList.value.map(m => ({
      role: m.role,
      content: m.content,
    }))

    loading.value = true
    chatList.value.push({ role: 'assistant', content: '', reasoning_content: '' })
    const assistantIndex = chatList.value.length - 1

    abortStream?.()
    abortStream = startSseStream({
      url: `${getEnvBaseUrl()}/pub/ai-stream`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        baseURL: baseURL.value,
        model: model.value,
        apiKey: apiKey.value,
      }),
      onMessage: (data) => {
        const reasoning = parseSseDeltaReasoning(data)
        const content = parseSseDeltaContent(data)
        const item = chatList.value[assistantIndex]
        if (!item)
          return
        if (reasoning)
          item.reasoning_content = (item.reasoning_content || '') + reasoning
        if (content)
          item.content += content
      },
      onError: () => {
        loading.value = false
      },
      onDone: () => {
        loading.value = false
      },
    })
  }

  onUnmounted(() => {
    abortStream?.()
  })

  return {
    modelList,
    chatList,
    inputText,
    baseURL,
    model,
    apiKey,
    loading,
    sendMessage,
  }
}

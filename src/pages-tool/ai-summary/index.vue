<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: 'AI 摘要' },
})

const nuxtHome = import.meta.env.VITE_NUXT_HOME_URL || 'http://localhost:5050'
const originalText = ref('')
const summaryText = ref('')
const loading = ref(false)
const style = ref('concise')
const length = ref('medium')

const styleLabels: Record<string, string> = {
  concise: '简洁',
  detailed: '详细',
  bullet: '要点',
}
const lengthLabels: Record<string, string> = {
  short: '短',
  medium: '中',
  long: '长',
}

function buildPrompt() {
  return `请用${styleLabels[style.value]}风格、${lengthLabels[length.value]}篇幅，为以下文章生成中文摘要：\n\n${originalText.value}`
}

async function generateSummary() {
  if (!originalText.value.trim()) {
    uni.showToast({ title: '请输入原文', icon: 'none' })
    return
  }
  loading.value = true
  summaryText.value = ''
  try {
    // #ifdef H5
    const res = await fetch(`${nuxtHome}/api/ai-summary-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: buildPrompt() }],
        stream: true,
      }),
    })
    if (!res.ok || !res.body) {
      uni.showToast({ title: 'AI 服务不可用，请配置 Nuxt AI_SUMMARY_API_KEY', icon: 'none' })
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      const chunk = decoder.decode(value)
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ') || line.includes('[DONE]'))
          continue
        try {
          const json = JSON.parse(line.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta)
            summaryText.value += delta
        }
        catch { /* skip */ }
      }
    }
    // #endif
    // #ifndef H5
    uni.showToast({ title: 'AI 摘要请在 H5 使用或打开 Web 版', icon: 'none' })
    // #endif
  }
  catch {
    uni.showToast({ title: '生成失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

function copySummary() {
  uni.setClipboardData({ data: summaryText.value })
}
</script>

<template>
  <scroll-view scroll-y class="ai-page cyber-page-grid u-page-scroll u-page-body py-4">
    <cyber-card class="cyber-card-pad-sm">
      <view class="u-gap-2 mb-3 flex flex-wrap">
        <wd-button
          v-for="(label, key) in styleLabels"
          :key="key"
          size="small"
          :type="style === key ? 'primary' : undefined"
          @click="style = key"
        >
          {{ label }}
        </wd-button>
      </view>
      <wd-textarea v-model="originalText" label="原文" placeholder="粘贴文章内容" />
      <wd-button block class="mt-4" :loading="loading" @click="generateSummary">
        生成摘要
      </wd-button>
      <wd-textarea v-model="summaryText" label="摘要结果" class="mt-4" />
      <wd-button v-if="summaryText" block class="mt-2" @click="copySummary">
        复制摘要
      </wd-button>
    </cyber-card>
    <view class="cyber-glass-card mt-4 p-3">
      <text class="text-xs text-tech-subtle">依赖 blog-home-nuxt Nitro 代理（{{ nuxtHome }}），需配置 AI_SUMMARY_API_KEY</text>
    </view>
  </scroll-view>
</template>

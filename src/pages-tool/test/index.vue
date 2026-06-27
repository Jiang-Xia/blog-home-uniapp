<script lang="ts" setup>
/**
 * 开发测试 Lab — Toast、主题说明、Nuxt ai-summary-status 探测
 */
definePage({
  style: { navigationBarTitleText: '开发测试' },
})

const nuxtHome = import.meta.env.VITE_NUXT_HOME_URL || 'https://jiang-xia.top'
const statusResult = ref<string>('')
const statusLoading = ref(false)

const toastItems = [
  { label: 'Success', icon: 'success' as const, title: '操作成功' },
  { label: 'None', icon: 'none' as const, title: '这是一条提示' },
  { label: 'Error', icon: 'error' as const, title: '请求失败' },
  { label: 'Loading', icon: 'loading' as const, title: '加载中' },
]

function showToastDemo(item: typeof toastItems[number]) {
  uni.showToast({ title: item.title, icon: item.icon, duration: 2000 })
}

/** 探测 Nuxt ai-summary-status 是否已配置 API Key */
async function checkAiSummaryStatus() {
  statusLoading.value = true
  statusResult.value = ''
  try {
    const res = await new Promise<{ data?: { configured?: boolean } }>((resolve, reject) => {
      uni.request({
        url: `${nuxtHome}/api/ai-summary-status`,
        success: r => resolve({ data: r.data as { configured?: boolean } }),
        fail: reject,
      })
    })
    statusResult.value = res.data?.configured
      ? 'configured: true — AI 摘要服务已就绪'
      : 'configured: false — 请设置 AI_SUMMARY_API_KEY'
  }
  catch (e: any) {
    statusResult.value = e?.errMsg || '网络请求失败'
  }
  finally {
    statusLoading.value = false
  }
}
</script>

<template>
  <scroll-view scroll-y class="test-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4">
      <tool-card title="Toast 提示">
        <text class="test-tip mb-3 block text-xs text-tech-subtle">
          测试 uni.showToast 各 icon 变体（success / none / error / loading）。
        </text>
        <view class="u-gap-2 flex flex-wrap">
          <view v-for="item in toastItems" :key="item.label">
            <wd-button size="small" @click="showToastDemo(item)">
              {{ item.label }}
            </wd-button>
          </view>
        </view>
      </tool-card>

      <tool-card title="主题说明">
        <text class="text-sm text-tech-muted leading-relaxed">
          本应用使用 cyber 暗色主题（--tech-* CSS 变量）。导航栏、卡片与工具页样式随全站主题配置生效；H5 与微信小程序共用同一套 cyber-theme.scss。
        </text>
      </tool-card>

      <tool-card title="SSE / AI 摘要服务探测">
        <text class="test-tip mb-3 block text-xs text-tech-subtle">
          调用 Nuxt <text class="font-mono">GET /api/ai-summary-status</text> 检测 AI 摘要代理是否配置（非流式，用于联调 blog-home-nuxt）。
        </text>
        <view class="u-gap-2 flex flex-wrap items-center">
          <view>
            <wd-button size="small" type="primary" :loading="statusLoading" @click="checkAiSummaryStatus">
              检测 ai-summary-status
            </wd-button>
          </view>
          <text class="text-xs text-tech-subtle">{{ nuxtHome }}</text>
        </view>
        <view v-if="statusResult" class="status-output mt-3">
          <text class="text-sm text-tech">{{ statusResult }}</text>
        </view>
      </tool-card>
    </view>
  </scroll-view>
</template>

<style scoped>
.status-output {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
  background: var(--tech-shell-header, rgba(255, 255, 255, 0.04));
}

.test-tip {
  line-height: 1.5;
}
</style>

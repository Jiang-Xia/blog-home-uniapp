<script lang="ts" setup>
/**
 * AI 文章摘要 — 对齐 Nuxt ai-summary，逻辑在 useAiSummary composable
 */
import { useAiSummary } from '@/composables/tool/use-ai-summary'

definePage({
  style: { navigationBarTitleText: 'AI 摘要' },
})

const {
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
} = useAiSummary()

const styleKeys = Object.keys(styleLabels) as Array<keyof typeof styleLabels>
const lengthKeys = Object.keys(lengthLabels) as Array<keyof typeof lengthLabels>

function regenerateSummary() {
  if (!loading.value)
    generateSummary()
}
</script>

<template>
  <scroll-view scroll-y class="ai-summary-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4">
      <view
        v-if="serviceConfigured === false"
        class="service-warning rounded-lg px-4 py-3"
      >
        <text class="text-warning text-sm">
          AI 摘要服务尚未配置。请在 blog-home-nuxt 环境变量中设置 AI_SUMMARY_API_KEY（DeepSeek API Key）后重启服务。
        </text>
      </view>

      <tool-card title="AI 文章摘要生成器" desc="将长文章转换为简洁摘要，支持多种摘要风格">
        <view class="u-grid-2 u-gap-3">
          <view class="u-stack-1">
            <text class="text-sm text-tech-muted">摘要风格</text>
            <view class="u-gap-2 mt-1 flex flex-wrap">
              <view v-for="key in styleKeys" :key="key">
                <wd-button
                  size="small"
                  :disabled="loading"
                  :type="summaryStyle === key ? 'primary' : undefined"
                  @click="summaryStyle = key"
                >
                  {{ styleLabels[key] }}
                </wd-button>
              </view>
            </view>
          </view>
          <view class="u-stack-1">
            <text class="text-sm text-tech-muted">摘要长度</text>
            <view class="u-gap-2 mt-1 flex flex-wrap">
              <view v-for="key in lengthKeys" :key="key">
                <wd-button
                  size="small"
                  :disabled="loading"
                  :type="summaryLength === key ? 'primary' : undefined"
                  @click="summaryLength = key"
                >
                  {{ lengthLabels[key] }}
                </wd-button>
              </view>
            </view>
          </view>
        </view>
      </tool-card>

      <view class="u-stack-4">
        <tool-card title="原文内容">
          <wd-textarea
            v-model="originalText"
            placeholder="粘贴您的文章内容..."
            :disabled="loading"
            :maxlength="MAX_CONTENT_CHARS"
          />
          <view class="u-gap-2 mt-3 flex flex-wrap items-center justify-between">
            <text class="text-xs" :class="wordCountClass">
              字数: {{ originalText.length }} / 推荐 500-3000，上限 {{ MAX_CONTENT_CHARS }}（最少 {{ MIN_CONTENT_CHARS }}）
            </text>
            <view class="u-gap-2 flex flex-wrap">
              <view>
                <wd-button size="small" :disabled="loading || !originalText" @click="clearOriginal">
                  清空
                </wd-button>
              </view>
              <view>
                <wd-button
                  size="small"
                  type="primary"
                  :loading="loading"
                  :disabled="loading || !canGenerate"
                  @click="generateSummary"
                >
                  {{ loading ? '生成中...' : '生成摘要' }}
                </wd-button>
              </view>
            </view>
          </view>
        </tool-card>

        <tool-card title="AI 摘要">
          <view v-if="!summary && !loading" class="summary-empty flex items-center justify-center">
            <text class="text-tech-faint text-sm">输入文章内容并点击生成摘要</text>
          </view>
          <view v-else-if="loading && !summary" class="summary-empty flex items-center justify-center">
            <text class="text-sm text-tech-muted">AI 正在分析文章内容...</text>
          </view>
          <view v-else class="u-stack-3">
            <view class="summary-output">
              <text class="whitespace-pre-wrap text-sm text-tech leading-relaxed">{{ summary }}</text>
              <text v-if="loading" class="summary-cursor">|</text>
            </view>
            <view class="u-gap-2 flex flex-wrap">
              <view>
                <wd-button size="small" :disabled="!summary" @click="copySummary">
                  复制
                </wd-button>
              </view>
              <view>
                <wd-button size="small" :disabled="!summary" @click="exportAsMarkdown">
                  导出
                </wd-button>
              </view>
              <view>
                <wd-button size="small" :disabled="loading" @click="regenerateSummary">
                  重新生成
                </wd-button>
              </view>
            </view>
          </view>
        </tool-card>
      </view>

      <tool-card v-if="summaryHistory.length > 0" title="历史记录">
        <view class="mb-3 flex justify-end">
          <view>
            <wd-button size="small" @click="clearHistory">
              清空历史
            </wd-button>
          </view>
        </view>
        <view class="history-list u-stack-3">
          <view
            v-for="item in summaryHistory"
            :key="item.timestamp"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <text class="mb-1 block text-xs text-tech-subtle">
              {{ formatDate(item.timestamp) }} · {{ styleLabels[item.style] }} · {{ lengthLabels[item.length] }}
            </text>
            <text class="history-summary text-sm text-tech-muted">{{ item.summary }}</text>
          </view>
        </view>
      </tool-card>

      <view class="cyber-glass-card p-3">
        <text class="text-xs text-tech-subtle">
          依赖 blog-home-nuxt Nitro 代理（{{ nuxtHome }}），需配置 AI_SUMMARY_API_KEY
        </text>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.service-warning {
  border: 1px solid rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.1);
}

.text-warning {
  color: #fbbf24;
}

.text-error {
  color: #f87171;
}

.text-warning {
  color: #fbbf24;
}

.summary-empty {
  min-height: 200px;
}

.summary-output {
  min-height: 200px;
  padding: 12px;
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  background: var(--tech-shell-header, rgba(255, 255, 255, 0.04));
}

.summary-cursor {
  margin-left: 2px;
  color: var(--tech-accent, #37cdbe);
}

.history-list {
  max-height: 240px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
}

.history-summary {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>

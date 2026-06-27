<script lang="ts" setup>
/**
 * AI 流式对话 — 对齐 Nuxt tool/ai，SSE 经 blog-server /pub/ai-stream
 */
import { useAiChat } from '@/composables/tool/use-ai-chat'

definePage({
  style: { navigationBarTitleText: 'AI对话' },
})

const {
  modelList,
  chatList,
  inputText,
  baseURL,
  model,
  apiKey,
  loading,
  sendMessage,
} = useAiChat()
</script>

<template>
  <scroll-view scroll-y class="ai-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4">
      <tool-card title="参数配置">
        <view class="u-stack-3">
          <wd-input v-model="baseURL" label="baseURL" placeholder="https://api.deepseek.com" />
          <view class="u-stack-1">
            <text class="text-sm text-tech-muted">model</text>
            <view class="u-gap-2 mt-1 flex flex-wrap">
              <view v-for="item in modelList" :key="item.value">
                <wd-button
                  size="small"
                  :type="model === item.value ? 'primary' : undefined"
                  @click="model = item.value"
                >
                  {{ item.label }}
                </wd-button>
              </view>
            </view>
          </view>
          <wd-input v-model="apiKey" label="apiKey" placeholder="DeepSeek API Key" />
        </view>
      </tool-card>

      <view class="chat-shell cyber-glass-card overflow-hidden">
        <view class="chat-toolbar border-b border-tech px-3 py-2">
          <text class="text-sm text-tech-muted">{{ model }}</text>
        </view>

        <view class="chat-body u-stack-3 px-3 py-4">
          <view
            v-for="(item, index) in chatList"
            :key="index"
            class="chat-row"
            :class="item.role === 'user' ? 'chat-row-user' : 'chat-row-assistant'"
          >
            <view v-if="item.role === 'assistant'" class="chat-bubble chat-bubble-assistant">
              <view v-if="model === 'deepseek-reasoner' && item.reasoning_content" class="reasoning-block">
                <text class="block text-xs font-medium opacity-70">深度思考{{ loading && index === chatList.length - 1 ? '中' : '' }}：</text>
                <text class="text-xs opacity-60">{{ item.reasoning_content }}</text>
              </view>
              <text class="text-sm">{{ item.content }}</text>
              <text v-if="index === chatList.length - 1 && loading" class="loading-dot">…</text>
            </view>
            <view v-if="item.role === 'user'" class="chat-bubble chat-bubble-user">
              <text class="text-sm">{{ item.content }}</text>
            </view>
          </view>
        </view>

        <view class="chat-input-bar u-gap-2 flex flex-wrap items-end border-t border-tech px-3 py-3">
          <view class="min-w-0 flex-1">
            <wd-textarea v-model="inputText" placeholder="给AI发送消息" :disabled="loading" />
          </view>
          <view>
            <wd-button type="primary" :loading="loading" :disabled="loading" @click="sendMessage">
              发送
            </wd-button>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.border-tech {
  border-color: var(--tech-border, rgba(255, 255, 255, 0.12));
}

.chat-body {
  min-height: 280px;
}

.chat-row {
  display: flex;
  width: 100%;
}

.chat-row-assistant {
  justify-content: flex-start;
}

.chat-row-user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 90%;
  padding: 10px 12px;
  border-radius: 10px;
}

.chat-bubble-assistant {
  align-self: flex-start;
  background: var(--tech-shell-header, rgba(255, 255, 255, 0.06));
}

.chat-bubble-user {
  background: rgba(59, 130, 246, 0.25);
}

.reasoning-block {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--tech-border, rgba(255, 255, 255, 0.12));
}

.loading-dot {
  margin-left: 4px;
}
</style>

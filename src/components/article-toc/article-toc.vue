<script lang="ts" setup>
/**
 * 文章目录（移动端折叠面板）
 */
import type { ArticleTocItem } from '@/utils/article-toc'

const props = defineProps<{
  topics: ArticleTocItem[]
}>()

const expanded = ref(false)

function scrollToHeading(id: string) {
  // #ifdef H5
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  expanded.value = false
  // #endif
  // #ifndef H5
  uni.showToast({ title: '请在 H5 端使用目录跳转', icon: 'none' })
  // #endif
}
</script>

<template>
  <view v-if="props.topics.length" class="article-toc cyber-glass-card mb-4 overflow-hidden">
    <view class="flex items-center justify-between px-3 py-2" @click="expanded = !expanded">
      <text class="text-sm text-tech font-medium">目录 ({{ props.topics.length }})</text>
      <text class="text-xs text-tech-subtle">{{ expanded ? '收起' : '展开' }}</text>
    </view>
    <view v-if="expanded" class="border-t border-tech px-3 py-2">
      <view
        v-for="item in props.topics"
        :key="item.id"
        class="py-1 text-sm text-tech-primary"
        :class="item.level === '1' ? 'font-medium' : 'pl-3 text-xs'"
        @click="scrollToHeading(item.id)"
      >
        {{ item.text }}
      </view>
    </view>
  </view>
</template>

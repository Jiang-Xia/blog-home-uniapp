<script lang="ts" setup>
/**
 * 文章目录（移动端折叠面板）
 * - 点击项滚动至对应 heading（H5 document；小程序 scroll-into-view 由父页处理）
 */
import type { ArticleTocItem } from '@/utils/article-toc'

const props = defineProps<{
  topics: ArticleTocItem[]
}>()

const expanded = ref(false)

/** 滚动至标题锚点 */
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
  <view v-if="props.topics.length" class="article-toc mb-4 border border-gray-100 rounded-lg bg-gray-50">
    <view class="flex items-center justify-between px-3 py-2" @click="expanded = !expanded">
      <text class="text-sm font-medium">目录 ({{ props.topics.length }})</text>
      <text class="text-xs text-gray-500">{{ expanded ? '收起' : '展开' }}</text>
    </view>
    <view v-if="expanded" class="border-t border-gray-100 px-3 py-2">
      <view
        v-for="item in props.topics"
        :key="item.id"
        class="py-1 text-sm text-blue-600"
        :class="item.level === '1' ? 'font-medium' : 'pl-3 text-xs'"
        @click="scrollToHeading(item.id)"
      >
        {{ item.text }}
      </view>
    </view>
  </view>
</template>

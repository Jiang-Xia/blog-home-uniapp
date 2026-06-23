<script setup lang="ts">
/**
 * 详情页相关文章推荐（简洁列表）
 * 数据来源：GET /article/related；对齐 blog-home-nuxt ArticleRelated
 */
import type { ArticleItem } from '@/api/article'

defineProps<{
  list: ArticleItem[]
}>()

const emit = defineEmits<{
  navigate: [id: number]
}>()
</script>

<template>
  <view v-if="list.length" class="article-related mt-6 border-t border-tech pt-4">
    <text class="mb-3 block text-sm text-tech-muted font-semibold">相关推荐</text>
    <view class="related-grid flex flex-col gap-2">
      <view
        v-for="item in list"
        :key="item.id"
        class="related-item border border-tech rounded-lg px-3 py-2"
        @click="emit('navigate', item.id)"
      >
        <text class="related-title block truncate text-sm text-tech font-medium">{{ item.title }}</text>
        <text
          v-if="item.description"
          class="related-desc mt-1 block truncate text-xs text-tech-muted"
        >
          {{ item.description }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.related-item {
  background-color: rgb(255 255 255 / 4%);
}
</style>

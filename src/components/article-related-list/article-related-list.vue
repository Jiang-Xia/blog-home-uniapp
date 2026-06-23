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
    <view class="related-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="related-item"
        @tap="emit('navigate', item.id)"
      >
        <text class="related-title">{{ item.title }}</text>
        <text v-if="item.description" class="related-desc">
          {{ item.description }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.related-list {
  display: flex;
  flex-direction: column;
}

.related-item {
  padding: 16rpx 0;
  border-bottom: 1px solid var(--tech-border);
}

.related-item:last-child {
  border-bottom: none;
}

.related-item:active {
  opacity: 0.85;
}

.related-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--tech-fg);
}

.related-desc {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 24rpx;
  color: var(--tech-fg-muted);
}
</style>

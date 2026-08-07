<script setup lang="ts">
/**
 * 详情页同作者相邻文章导航（上一篇 / 下一篇）
 * 数据来自 GET /article/info 的 prev / next 字段，对齐 blog-home-nuxt ArticleAdjacentNav
 */
export interface ArticleNavItem {
  id: number | string
  title: string
}

defineProps<{
  prev?: ArticleNavItem | null
  next?: ArticleNavItem | null
}>()

const emit = defineEmits<{
  navigate: [id: number | string]
}>()
</script>

<template>
  <view v-if="prev || next" class="article-adjacent-nav mt-6">
    <view class="adjacent-nav-row">
      <view
        v-if="prev"
        class="adjacent-link adjacent-link--prev cyber-glass-card cyber-card-pad-xs"
        @tap="emit('navigate', prev.id)"
      >
        <cyber-chevron direction="left" size="md" class="adjacent-arrow" />
        <text class="adjacent-label text-xs text-tech-muted">上一篇</text>
        <text class="adjacent-title truncate text-sm text-tech">{{ prev.title }}</text>
      </view>

      <view
        v-if="next"
        class="adjacent-link adjacent-link--next cyber-glass-card cyber-card-pad-xs"
        @tap="emit('navigate', next.id)"
      >
        <text class="adjacent-title truncate text-sm text-tech">{{ next.title }}</text>
        <text class="adjacent-label text-xs text-tech-muted">下一篇</text>
        <cyber-chevron size="md" class="adjacent-arrow" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.adjacent-nav-row {
  display: flex;
  flex-direction: column;
}

.adjacent-link {
  display: flex;
  min-width: 0;
  align-items: center;
}

.adjacent-link + .adjacent-link {
  margin-top: 12rpx;
}

.adjacent-link--next {
  justify-content: flex-end;
  text-align: right;
}

.adjacent-title {
  flex: 1;
  min-width: 0;
}

.adjacent-label,
.adjacent-arrow {
  flex-shrink: 0;
  margin: 0 6rpx;
}

.adjacent-arrow {
  font-size: 28rpx;
  line-height: 1;
}
</style>

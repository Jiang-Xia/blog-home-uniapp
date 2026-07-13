<script lang="ts" setup>
/**
 * RPG 等级徽章 — 作者 Lv / 文章 Lv / 神作（对齐 blog-home-nuxt RpgLevelBadge）
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  level: number
  variant?: 'author' | 'article' | 'masterpiece'
  size?: 'xs' | 'sm'
}>(), {
  variant: 'author',
  size: 'xs',
})

const label = computed(() => {
  if (props.variant === 'masterpiece')
    return '神作'
  if (props.variant === 'article')
    return `文 Lv${props.level}`
  return `Lv.${props.level}`
})
</script>

<template>
  <text
    class="rpg-level-badge"
    :class="[
      `rpg-level-badge--${variant}`,
      size === 'sm' ? 'rpg-level-badge--sm' : 'rpg-level-badge--xs',
    ]"
  >
    {{ label }}
  </text>
</template>

<style scoped>
.rpg-level-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  border-radius: 8rpx;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.rpg-level-badge--xs {
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  line-height: 1.2;
}

.rpg-level-badge--sm {
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  line-height: 1.2;
}

.rpg-level-badge--author {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2rpx 6rpx rgba(217, 119, 6, 0.35);
}

.rpg-level-badge--article {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 2rpx 6rpx rgba(79, 70, 229, 0.35);
}

.rpg-level-badge--masterpiece {
  background: linear-gradient(135deg, #f472b6, #ec4899);
  box-shadow: 0 2rpx 6rpx rgba(236, 72, 153, 0.35);
}
</style>

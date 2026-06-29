<script lang="ts" setup>
/**
 * RPG 成就面板 — 固定高度可滚动，卡片间距对齐 Nuxt AchievementPanel
 */
defineProps<{
  achievements: any[]
}>()
</script>

<template>
  <view class="achievement-panel mt-4">
    <text class="mb-2 block text-tech font-medium">成就</text>
    <scroll-view scroll-y class="ach-list-scroll">
      <view
        v-for="a in achievements"
        :key="a.code || a.id"
        class="cyber-glass-card achievement-card u-gap-2 flex items-center p-3"
      >
        <text class="text-lg">{{ a.completed ? '🏆' : '🔒' }}</text>
        <view class="flex-1">
          <text class="block text-sm text-tech font-medium">{{ a.name }}</text>
          <text class="text-xs text-tech-muted">{{ a.description }}</text>
        </view>
      </view>
      <view v-if="!achievements.length" class="py-2 text-center text-xs text-tech-subtle">
        暂无成就
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.ach-list-scroll {
  max-height: 360px;
}

.achievement-card {
  margin-bottom: 16rpx;
}

.achievement-card:last-child {
  margin-bottom: 0;
}
</style>

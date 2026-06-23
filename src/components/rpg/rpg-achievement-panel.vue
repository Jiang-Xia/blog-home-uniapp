<script lang="ts" setup>
defineProps<{
  achievements: any[]
}>()
</script>

<template>
  <view class="achievement-panel mt-4">
    <text class="mb-2 block text-tech font-medium">成就</text>
    <view v-for="a in achievements" :key="a.code || a.id" class="cyber-glass-card mb-2 flex items-center gap-2 p-3">
      <text class="text-lg">{{ a.completed ? '🏆' : '🔒' }}</text>
      <view class="flex-1">
        <text class="block text-sm text-tech font-medium">{{ a.name }}</text>
        <text class="text-xs text-tech-muted">{{ a.description }}</text>
      </view>
    </view>
    <view v-if="!achievements.length" class="py-2 text-center text-xs text-tech-subtle">
      暂无成就
    </view>
  </view>
</template>

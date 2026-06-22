<script lang="ts" setup>
defineProps<{
  achievements: any[]
}>()
</script>

<template>
  <view class="achievement-panel mt-4">
    <text class="mb-2 block font-medium">成就</text>
    <view v-for="a in achievements" :key="a.code || a.id" class="mb-2 flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm">
      <text class="text-lg">{{ a.completed ? '🏆' : '🔒' }}</text>
      <view class="flex-1">
        <text class="block text-sm font-medium">{{ a.name }}</text>
        <text class="text-xs text-gray-500">{{ a.description }}</text>
      </view>
    </view>
    <view v-if="!achievements.length" class="py-2 text-center text-xs text-gray-400">
      暂无成就
    </view>
  </view>
</template>

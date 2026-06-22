<script lang="ts" setup>
defineProps<{
  quests: any[]
}>()

defineEmits<{
  claim: [code: string]
}>()

function questCode(q: any) {
  return q.code || q.questCode || ''
}
</script>

<template>
  <view class="quest-panel">
    <text class="mb-2 block font-medium">任务</text>
    <view v-for="q in quests" :key="questCode(q)" class="mb-2 rounded-lg bg-white p-3 shadow-sm">
      <view class="flex items-center justify-between">
        <text class="text-sm font-medium">{{ q.name || q.questName }}</text>
        <text v-if="q.claimed" class="text-xs text-green-600">已领取</text>
        <text v-else-if="q.completed" class="text-xs text-blue-600">可领取</text>
        <text v-else class="text-xs text-gray-400">{{ q.progress ?? 0 }}/{{ q.target ?? 1 }}</text>
      </view>
      <text v-if="q.description" class="mt-1 block text-xs text-gray-500">{{ q.description }}</text>
      <wd-button
        v-if="q.completed && !q.claimed"
        size="small"
        class="mt-2"
        @click="$emit('claim', questCode(q))"
      >
        领取奖励
      </wd-button>
    </view>
    <view v-if="!quests.length" class="py-4 text-center text-sm text-gray-400">
      暂无任务
    </view>
  </view>
</template>

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
  <view class="quest-panel mt-4">
    <text class="mb-2 block text-tech font-medium">任务</text>
    <view v-for="q in quests" :key="questCode(q)" class="cyber-glass-card mb-2 p-3">
      <view class="flex items-center justify-between">
        <text class="text-sm text-tech font-medium">{{ q.name || q.questName }}</text>
        <text v-if="q.claimed" class="text-xs text-green-400">已领取</text>
        <text v-else-if="q.completed" class="text-xs text-tech-primary">可领取</text>
        <text v-else class="text-xs text-tech-subtle">{{ q.progress ?? 0 }}/{{ q.target ?? 1 }}</text>
      </view>
      <text v-if="q.description" class="mt-1 block text-xs text-tech-muted">{{ q.description }}</text>
      <wd-button
        v-if="q.completed && !q.claimed"
        size="small"
        class="mt-2"
        @click="$emit('claim', questCode(q))"
      >
        领取奖励
      </wd-button>
    </view>
    <view v-if="!quests.length" class="py-4 text-center text-sm text-tech-subtle">
      暂无任务
    </view>
  </view>
</template>

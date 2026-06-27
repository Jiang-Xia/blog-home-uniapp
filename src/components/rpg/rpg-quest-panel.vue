<script lang="ts" setup>
/**
 * RPG 任务面板（分组 Tab：日常/悬赏/周常/特殊）
 */
import type { UserQuestProgress } from '@/types/rpg'

const props = defineProps<{
  questGroups: {
    daily: UserQuestProgress[]
    bounty: UserQuestProgress[]
    weekly: UserQuestProgress[]
    special: UserQuestProgress[]
  }
}>()

defineEmits<{
  claim: [code: string]
}>()

const groupTabs = [
  { key: 'daily', label: '日常' },
  { key: 'bounty', label: '悬赏' },
  { key: 'weekly', label: '周常' },
  { key: 'special', label: '特殊' },
] as const

const activeGroup = ref<(typeof groupTabs)[number]['key']>('daily')

const currentQuests = computed(() => props.questGroups[activeGroup.value] || [])

function questCode(q: UserQuestProgress) {
  return q.code || (q as any).questCode || ''
}

function progressPercent(q: UserQuestProgress) {
  const target = q.targetCount || (q as any).target || 1
  return Math.min(100, Math.round(((q.progress ?? 0) / target) * 100))
}
</script>

<template>
  <view class="quest-panel mt-4">
    <text class="mb-2 block text-tech font-medium">任务</text>
    <scroll-view scroll-x class="group-tabs mb-3">
      <view class="flex">
        <text
          v-for="tab in groupTabs"
          :key="tab.key"
          class="group-tab mr-3 shrink-0"
          :class="activeGroup === tab.key ? 'group-tab-active' : ''"
          @click="activeGroup = tab.key"
        >
          {{ tab.label }}
        </text>
      </view>
    </scroll-view>
    <view v-for="q in currentQuests" :key="questCode(q)" class="cyber-glass-card mb-2 p-3">
      <view class="flex items-center justify-between">
        <text class="text-sm text-tech font-medium">{{ q.name || (q as any).questName }}</text>
        <text v-if="q.claimed" class="text-xs text-green-400">已领取</text>
        <text v-else-if="q.completed" class="text-xs text-tech-primary">可领取</text>
        <text v-else class="text-xs text-tech-subtle">{{ q.progress ?? 0 }}/{{ q.targetCount ?? (q as any).target ?? 1 }}</text>
      </view>
      <text v-if="q.description" class="mt-1 block text-xs text-tech-muted">{{ q.description }}</text>
      <view v-if="!q.completed && !q.claimed" class="u-bg-white-20 mt-2 h-1.5 overflow-hidden rounded-full">
        <view class="h-full rounded-full bg-purple-400" :style="{ width: `${progressPercent(q)}%` }" />
      </view>
      <view v-if="q.completed && !q.claimed" class="mt-2">
        <wd-button size="small" @click="$emit('claim', questCode(q))">
          领取奖励
        </wd-button>
      </view>
    </view>
    <view v-if="!currentQuests.length" class="py-4 text-center text-sm text-tech-subtle">
      暂无任务
    </view>
  </view>
</template>

<style scoped>
.group-tabs {
  white-space: nowrap;
}
.group-tab {
  font-size: 13px;
  color: rgba(226, 232, 240, 0.55);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}
.group-tab-active {
  color: #fde68a;
  background: rgba(139, 92, 246, 0.25);
  font-weight: 600;
}
</style>

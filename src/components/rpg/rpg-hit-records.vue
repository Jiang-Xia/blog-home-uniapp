<script lang="ts" setup>
/**
 * 敏感词命中记录（懒加载，对齐 Nuxt RpgProfileCard 内区块）
 */
import type { SensitiveHitRecord } from '@/types/rpg'
import { formatDateMinute } from '@/utils/date-time'

const props = defineProps<{
  records: SensitiveHitRecord[]
  total: number
  /** 来自 RPG 状态的累计命中次数，列表未加载时用于默认展示 */
  hitsCount?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  load: []
}>()

const expanded = ref(false)

/** 标题展示次数：优先分页 total，否则用状态里的累计命中数 */
const displayCount = computed(() => props.total || props.hitsCount || 0)

function toggle() {
  expanded.value = !expanded.value
  if (expanded.value && !props.records.length)
    emit('load')
}

const sourceLabel: Record<string, string> = {
  comment: '评论',
  msgboard: '留言',
  reply: '回复',
}
</script>

<template>
  <cyber-card class="hit-records cyber-card-pad-sm mt-4">
    <view class="flex items-center justify-between" @click="toggle">
      <text class="text-sm text-tech font-medium">敏感词命中记录 ({{ displayCount }}次)</text>
      <text class="text-xs text-tech-subtle">{{ expanded ? '▼' : '▶' }}</text>
    </view>
    <view v-if="expanded" class="mt-3">
      <view v-if="loading" class="py-4 text-center text-xs text-tech-subtle">
        加载中...
      </view>
      <view v-else-if="!records.length" class="py-4 text-center text-xs text-tech-subtle">
        暂无记录
      </view>
      <view v-for="r in records" :key="r.id" class="hit-row mb-2 pb-2">
        <view class="flex items-center justify-between">
          <text class="text-xs text-tech-primary">{{ sourceLabel[r.sourceType] || r.sourceType }}</text>
          <text class="text-tech-faint text-xs">{{ formatDateMinute(r.createTime) }}</text>
        </view>
        <text class="mt-1 block text-xs text-tech-muted">{{ r.content }}</text>
        <text v-if="r.hitWords" class="mt-1 block text-xs text-red-400">命中：{{ r.hitWords }}</text>
      </view>
    </view>
  </cyber-card>
</template>

<style scoped>
.hit-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.hit-row:last-child {
  border-bottom: none;
}
</style>

<script lang="ts" setup>
import type { BanStatus, RpgStatus, SignInfo } from '@/types/rpg'
import { formatDateMinute } from '@/utils/date-time'

const props = defineProps<{
  status: RpgStatus
  signInfo: SignInfo | null
  banStatus?: BanStatus | null
  signingIn?: boolean
}>()

defineEmits<{
  signIn: []
}>()

const expPercent = computed(() => {
  if (!props.status?.expToNext)
    return 0
  return Math.min(100, Math.round((props.status.exp / props.status.expToNext) * 100))
})
</script>

<template>
  <view class="status-panel rounded-xl from-indigo-600 to-purple-700 bg-gradient-to-br p-4 text-white shadow-lg">
    <view class="flex items-start justify-between">
      <view>
        <text class="block text-3xl font-bold">Lv.{{ status.level }}</text>
        <text class="mt-1 block text-sm opacity-90">{{ status.roleReward?.titleName || '冒险者' }}</text>
      </view>
      <view v-if="signInfo" class="text-right text-xs opacity-90">
        <text class="block">连续 {{ status.consecutiveSignDays ?? signInfo.consecutiveDays ?? 0 }} 天</text>
      </view>
    </view>
    <view class="mt-3">
      <view class="u-bg-white-20 h-2 overflow-hidden rounded-full">
        <view class="h-full rounded-full bg-amber-300" :style="{ width: `${expPercent}%` }" />
      </view>
      <text class="mt-1 block text-xs opacity-80">EXP {{ status.exp }} / {{ status.expToNext ?? '—' }}</text>
    </view>
    <view class="u-gap-3 mt-3 flex flex-wrap text-sm">
      <text>❤️ {{ status.lifeValue }}</text>
      <text>💎 {{ status.currency ?? 0 }}</text>
      <text>⭐ {{ status.reputation ?? 0 }}</text>
    </view>
    <view v-if="banStatus?.banned" class="mt-3 rounded bg-red-500/30 px-2 py-1 text-xs">
      禁言中{{ banStatus.banEndTime ? ` · 至 ${formatDateMinute(banStatus.banEndTime)}` : '' }}
    </view>
    <wd-button
      size="small"
      class="mt-4"
      :disabled="signInfo?.signedToday || signingIn"
      @click="$emit('signIn')"
    >
      {{ signInfo?.signedToday ? '今日已签' : '每日签到' }}
    </wd-button>
  </view>
</template>

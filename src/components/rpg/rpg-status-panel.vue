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
  <view class="status-panel cyber-glass-card cyber-card-pad-sm">
    <view class="flex items-start justify-between">
      <view>
        <text class="cyber-gradient-text-amber block text-3xl font-bold">Lv.{{ status.level }}</text>
        <text class="mt-1 block text-sm text-tech-muted">{{ status.roleReward?.titleName || '冒险者' }}</text>
      </view>
      <view v-if="signInfo" class="text-right text-xs text-tech-subtle">
        <text class="block">连续 {{ status.consecutiveSignDays ?? signInfo.consecutiveDays ?? 0 }} 天</text>
      </view>
    </view>
    <view class="mt-3">
      <view class="u-bg-white-20 h-2 overflow-hidden rounded-full">
        <view class="h-full rounded-full bg-amber-300" :style="{ width: `${expPercent}%` }" />
      </view>
      <text class="mt-1 block text-xs text-tech-subtle">EXP {{ status.exp }} / {{ status.expToNext ?? '—' }}</text>
    </view>
    <view class="u-gap-3 mt-3 flex flex-wrap text-sm text-tech-muted">
      <view class="flex items-center">
        <cyber-icon name="heart" size="28rpx" />
        <text class="ml-1">{{ status.lifeValue }}</text>
      </view>
      <view class="flex items-center">
        <cyber-icon name="gem" size="28rpx" />
        <text class="ml-1">{{ status.currency ?? 0 }}</text>
      </view>
      <view class="flex items-center">
        <cyber-icon name="star" size="28rpx" />
        <text class="ml-1">{{ status.reputation ?? 0 }}</text>
      </view>
    </view>
    <view v-if="banStatus?.banned" class="cyber-alert cyber-alert-warning mt-3 text-xs !p-2">
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

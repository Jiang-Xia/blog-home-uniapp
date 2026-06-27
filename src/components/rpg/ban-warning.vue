<script lang="ts" setup>
/**
 * 禁言警告 — 禁言状态下展示剩余时间与解封提醒
 */
import type { BanStatus } from '@/types/rpg'
import { formatDateMinute } from '@/utils/date-time'
import dayjs from 'dayjs'

const props = defineProps<{
  banStatus: BanStatus | null
}>()

const remainingText = computed(() => {
  if (!props.banStatus?.banned)
    return ''
  if (props.banStatus.remainingMs > 0) {
    const ms = props.banStatus.remainingMs
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days}天${hours % 24}小时`
    }
    return `${hours}小时${minutes}分钟`
  }
  if (!props.banStatus.banEndTime)
    return ''
  const end = dayjs(props.banStatus.banEndTime)
  const diffMs = end.diff(dayjs(), 'millisecond')
  if (diffMs <= 0)
    return '即将解封'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days}天${hours % 24}小时`
  }
  return `${hours}小时${minutes}分钟`
})

const banEndTimeText = computed(() => {
  if (!props.banStatus?.banEndTime)
    return ''
  return formatDateMinute(props.banStatus.banEndTime)
})
</script>

<template>
  <view v-if="banStatus?.banned" class="ban-warning cyber-glass-card">
    <text class="ban-warning__icon">🔇</text>
    <view class="ban-warning__info">
      <text class="ban-warning__title">您已被禁言</text>
      <text v-if="remainingText" class="ban-warning__detail">
        剩余时间: {{ remainingText }}
      </text>
      <text v-if="banEndTimeText" class="ban-warning__end text-tech-subtle">
        解封时间: {{ banEndTimeText }}
      </text>
      <text class="ban-warning__tip text-tech-muted">
        禁言期间无法签到、评论、留言和回复，但可以正常浏览内容
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ban-warning {
  display: flex;
  padding: 32rpx;
  margin: 24rpx 0;
  border: 1px solid #fecaca;
  background: linear-gradient(135deg, #fef2f2, rgba(254, 242, 242, 0.85));
  border-radius: 24rpx;
}

.ban-warning__icon {
  font-size: 64rpx;
  line-height: 1;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.ban-warning__info {
  flex: 1;
  min-width: 0;
}

.ban-warning__title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 12rpx;
}

.ban-warning__detail {
  display: block;
  font-size: 28rpx;
  color: #991b1b;
  margin-bottom: 8rpx;
}

.ban-warning__end {
  display: block;
  font-size: 24rpx;
  margin-bottom: 16rpx;
}

.ban-warning__tip {
  display: block;
  font-size: 24rpx;
  line-height: 1.4;
}
</style>

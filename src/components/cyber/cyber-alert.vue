<script setup lang="ts">
import type { AppIconName } from '@/config/app-icons'

defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

const props = withDefaults(defineProps<{
  variant?: 'warning' | 'info'
}>(), {
  variant: 'info',
})

const alertIcon = computed<AppIconName>(() => props.variant === 'warning' ? 'warning' : 'bulb')
</script>

<template>
  <view
    class="cyber-alert"
    :class="props.variant === 'warning' ? 'cyber-alert-warning' : 'cyber-alert-info'"
  >
    <cyber-icon :name="alertIcon" size="40rpx" class="cyber-alert-icon" />
    <view class="u-flex-1 min-w-0">
      <slot />
    </view>
  </view>
</template>

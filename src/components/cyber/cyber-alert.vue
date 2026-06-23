<script setup lang="ts">
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  variant?: 'warning' | 'info'
}>(), {
  variant: 'info',
})
</script>

<template>
  <view
    class="cyber-alert"
    :class="variant === 'warning' ? 'cyber-alert-warning' : 'cyber-alert-info'"
  >
    <text class="shrink-0 text-lg">{{ variant === 'warning' ? '⚠️' : '💡' }}</text>
    <view class="u-flex-1 min-w-0">
      <slot />
    </view>
  </view>
</template>

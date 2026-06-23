<script setup lang="ts">
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
    <view class="min-w-0 flex-1">
      <slot />
    </view>
  </view>
</template>

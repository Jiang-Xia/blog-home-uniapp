<script setup lang="ts">
/**
 * 页面区块标题（label + title + subtitle）
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  label?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}>(), {
  label: '',
  subtitle: '',
  align: 'center',
})
</script>

<template>
  <view :class="align === 'left' ? 'text-left' : 'text-center'">
    <text v-if="label" class="cyber-section-label mb-1.5 block">{{ label }}</text>
    <text class="block text-xl text-tech font-bold">{{ title }}</text>
    <text v-if="subtitle" class="mt-1.5 block text-xs text-tech-muted">{{ subtitle }}</text>
  </view>
</template>

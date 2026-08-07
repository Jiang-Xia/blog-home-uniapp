<script setup lang="ts">
/**
 * 工具卡片壳 — 对齐 Nuxt CyberToolCard
 */
defineProps<{
  title?: string
  desc?: string
}>()
</script>

<template>
  <cyber-card class="cyber-card-pad-sm">
    <view v-if="title" class="u-stack-1 mb-3">
      <text class="block text-base text-tech font-medium">{{ title }}</text>
      <text v-if="desc" class="block text-xs text-tech-muted">{{ desc }}</text>
    </view>
    <slot />
  </cyber-card>
</template>

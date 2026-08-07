<script setup lang="ts">
/** 工具分区标题 — 对齐 Nuxt CryptoToolSection */
defineProps<{
  label: string
}>()
</script>

<template>
  <view class="tool-section">
    <view class="mb-3 flex items-center">
      <text class="cyber-section-label shrink-0">{{ label }}</text>
      <view class="bg-tech-border ml-3 h-px flex-1" />
    </view>
    <slot />
  </view>
</template>

<style scoped>
.bg-tech-border {
  background-color: var(--tech-border, rgba(255, 255, 255, 0.12));
}
</style>

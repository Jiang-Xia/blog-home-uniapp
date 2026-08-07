<script setup lang="ts">
/** 算法说明折叠区 — 对齐 Nuxt CryptoAboutPanel（小程序用 view 模拟 details） */
defineProps<{
  title: string
}>()

const expanded = ref(true)
</script>

<template>
  <view class="cyber-glass-card overflow-hidden">
    <view class="flex items-center px-4 py-3" @click="expanded = !expanded">
      <text class="flex-1 text-sm text-tech font-medium">{{ title }}</text>
      <text class="text-xs text-tech-subtle">{{ expanded ? '▼' : '▶' }}</text>
    </view>
    <view v-if="expanded" class="border-t border-tech px-4 py-3 text-sm text-tech-muted leading-relaxed">
      <slot />
    </view>
  </view>
</template>

<style scoped>
.border-tech {
  border-color: var(--tech-border, rgba(255, 255, 255, 0.12));
}
</style>

<script setup lang="ts">
withDefaults(defineProps<{
  padding?: string
}>(), {
  padding: 'p-3',
})
</script>

<template>
  <view class="cyber-glass-card" :class="padding">
    <slot />
  </view>
</template>

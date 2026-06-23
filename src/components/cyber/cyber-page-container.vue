<script setup lang="ts">
import CyberSectionHeader from '@/components/cyber/cyber-section-header.vue'

defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  label?: string
  title?: string
  subtitle?: string
  grid?: boolean
}>(), {
  label: '',
  title: '',
  subtitle: '',
  grid: true,
})
</script>

<template>
  <view class="u-page-body py-3" :class="grid ? 'cyber-page-grid' : 'cyber-page'">
    <CyberSectionHeader
      v-if="title"
      class="mb-5"
      :label="label"
      :title="title"
      :subtitle="subtitle"
    />
    <slot />
  </view>
</template>

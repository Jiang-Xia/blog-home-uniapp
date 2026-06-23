<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'small'
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'default',
  block: false,
})

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <view
    :class="[
      variant === 'primary' ? 'cyber-btn-primary' : 'cyber-btn-secondary',
      size === 'small' ? 'cyber-btn-sm' : '',
      block ? 'cyber-btn-block' : '',
    ]"
    @click="emit('click')"
  >
    <slot />
  </view>
</template>

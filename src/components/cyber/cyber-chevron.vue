<script setup lang="ts">
/**
 * 列表/导航箭头（wot-ui wd-icon name=right/left）
 * - cell：列表行 / 用户卡，32rpx
 * - md：上下篇等次要导航，28rpx
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

const props = withDefaults(defineProps<{
  direction?: 'left' | 'right'
  size?: 'cell' | 'md'
}>(), {
  direction: 'right',
  size: 'cell',
})

const iconName = computed(() => props.direction === 'left' ? 'left' : 'right')

const iconSize = computed(() => props.size === 'md' ? '28rpx' : '32rpx')
</script>

<template>
  <wd-icon
    :name="iconName"
    :size="iconSize"
    custom-class="cyber-chevron"
    color="var(--tech-fg-faint)"
  />
</template>

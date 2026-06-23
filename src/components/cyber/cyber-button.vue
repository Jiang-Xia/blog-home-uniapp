<script setup lang="ts">
/**
 * 赛博风按钮
 * - 微信小程序须 virtualHost，否则 block / 外部 class 无法作用到根节点
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'small'
  block?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'default',
  block: false,
  disabled: false,
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (!props.disabled)
    emit('click')
}
</script>

<template>
  <view
    :class="[
      variant === 'primary' ? 'cyber-btn-primary' : 'cyber-btn-secondary',
      size === 'small' ? 'cyber-btn-sm' : '',
      block ? 'cyber-btn-block' : '',
      disabled ? 'cyber-btn-disabled' : '',
    ]"
    @click="handleClick"
  >
    <slot />
  </view>
</template>

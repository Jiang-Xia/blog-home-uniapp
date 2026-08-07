<script setup lang="ts">
/**
 * 赛博风玻璃卡片容器
 * - 微信小程序须 virtualHost，否则组件为 inline 且外部 class 无法合并到根节点
 * - 布局类（flex 等）请写在 slot 内原生 view，勿写在 cyber-card 上
 * - 勿用 v-bind="$attrs"（小程序编译不支持），仅合并 class
 */
defineOptions({
  inheritAttrs: false,
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

const attrs = useAttrs()

const rootClass = computed(() => {
  const userClass = attrs.class
  if (!userClass)
    return 'cyber-glass-card'
  if (typeof userClass === 'string')
    return `cyber-glass-card ${userClass}`
  return ['cyber-glass-card', userClass]
})
</script>

<template>
  <view :class="rootClass">
    <slot />
  </view>
</template>

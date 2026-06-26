<script setup lang="ts">
/**
 * 赛博风玻璃卡片容器
 * - 微信小程序须 virtualHost，否则组件为 inline 且外部 class 无法合并到根节点
 * - 布局类（flex 等）请写在 slot 内原生 view，勿写在 cyber-card 上
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})
</script>

<template>
  <view class="cyber-glass-card">
    <slot />
  </view>
</template>

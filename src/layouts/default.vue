<script lang="ts" setup>
/**
 * 默认布局：页面内容 + 全站 RPG/WS 初始化（须在页面级挂载，勿放 App.vue）
 */
import RpgGlobalInit from '@/components/rpg/rpg-global-init.vue'
</script>

<template>
  <slot />
  <RpgGlobalInit />
</template>

<script lang="ts" setup>
/**
 * RPG 面板紧凑加载态 — 旋转光环 +「加载中…」文案，供各 Tab 复用
 */
</script>

<template>
  <view class="rpg-panel-loading rpg-panel-loading--compact">
    <view class="rpg-panel-loading__visual">
      <view class="rpg-panel-loading__ring" />
      <view class="rpg-panel-loading__ring rpg-panel-loading__ring--inner" />
      <text class="rpg-panel-loading__core">⚔️</text>
    </view>
    <text class="rpg-panel-loading__label text-tech-subtle">加载中...</text>
  </view>
</template>

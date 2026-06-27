<script lang="ts" setup>
/**
 * RPG 等级徽章 — 作者 Lv 展示
 */
defineProps<{
  level: number
}>()
</script>

<template>
  <text class="rpg-level-badge">Lv.{{ level }}</text>
</template>

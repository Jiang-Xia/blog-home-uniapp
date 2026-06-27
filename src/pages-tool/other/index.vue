<script lang="ts" setup>
/** 其他工具占位页 — 对齐 Nuxt tool/other */
definePage({
  style: { navigationBarTitleText: '其他工具' },
})
</script>

<template>
  <scroll-view scroll-y class="other-page cyber-page-grid u-page-scroll u-page-body py-4">
    <tool-card title="其他工具" desc="占位页，后续可扩展更多实用工具">
      <text class="text-sm text-tech-muted">敬请期待…</text>
    </tool-card>
  </scroll-view>
</template>

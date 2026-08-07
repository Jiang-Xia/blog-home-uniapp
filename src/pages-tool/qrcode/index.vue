<script lang="ts" setup>
/**
 * 旧路由兼容 — 重定向到 codes 条形/二维码页
 */
definePage({
  style: { navigationBarTitleText: '二维码' },
})

onLoad(() => {
  uni.redirectTo({ url: '/pages-tool/codes/index' })
})
</script>

<template>
  <view class="u-page-body flex items-center justify-center py-8">
    <text class="text-sm text-tech-muted">正在跳转…</text>
  </view>
</template>

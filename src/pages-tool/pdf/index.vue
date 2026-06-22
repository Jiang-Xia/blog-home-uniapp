<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: 'PDF 预览' },
})
</script>

<template>
  <view class="pdf-page px-4 py-6">
    <text class="block text-gray-600">PDF 预览工具（H5 专用）</text>
    <text class="mt-4 block text-sm text-gray-500">
      完整 PDF 预览与电子签名功能请访问 Web 版 /tool/pdf。小程序端可复制链接在浏览器打开。
    </text>
  </view>
</template>

<style scoped>
.pdf-page {
  min-height: 100vh;
  background: #fff;
}
</style>

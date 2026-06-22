<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: '关于' },
})
</script>

<template>
  <view class="about-page px-4 py-6">
    <text class="block text-xl font-bold">Blog Home</text>
    <text class="mt-4 block text-sm text-gray-600 leading-relaxed">
      博客三端架构中的移动端前台，基于 uni-app + Vue3 + TypeScript 构建，支持 H5、微信小程序与 App。
    </text>
    <text class="mt-4 block text-sm text-gray-600 leading-relaxed">
      功能涵盖文章阅读、用户中心、RPG 冒险玩法与实用工具，与 blog-home-nuxt 共享 blog-server 后端 API。
    </text>
    <view class="mt-6 rounded-lg bg-blue-50 p-4">
      <text class="block text-sm text-blue-800 font-medium">技术栈</text>
      <text class="mt-2 block text-xs text-blue-700">uni-app · Vue 3 · Pinia · wot-ui · UnoCSS · Socket.IO</text>
    </view>
  </view>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #fff;
}
</style>

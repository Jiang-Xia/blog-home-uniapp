<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: '开源与合作' },
})
</script>

<template>
  <view class="open-source-page px-4 py-6">
    <text class="block text-xl font-bold">三端项目说明</text>
    <view class="mt-4 space-y-3">
      <view class="rounded-lg bg-white p-4 shadow-sm">
        <text class="block font-medium">blog-home-nuxt</text>
        <text class="mt-1 block text-sm text-gray-600">Web 前台（Nuxt 3），端口 5050</text>
      </view>
      <view class="rounded-lg bg-white p-4 shadow-sm">
        <text class="block font-medium">blog-home-uniapp</text>
        <text class="mt-1 block text-sm text-gray-600">移动端前台（uni-app），H5 / 小程序 / App</text>
      </view>
      <view class="rounded-lg bg-white p-4 shadow-sm">
        <text class="block font-medium">blog-admin</text>
        <text class="mt-1 block text-sm text-gray-600">管理后台（Vue 3），端口 9856</text>
      </view>
      <view class="rounded-lg bg-white p-4 shadow-sm">
        <text class="block font-medium">blog-server</text>
        <text class="mt-1 block text-sm text-gray-600">NestJS 后端 API，端口 5000（闭源）</text>
      </view>
    </view>
    <view class="mt-6 border border-orange-200 rounded-lg bg-orange-50 p-4">
      <text class="block text-sm text-orange-800 font-medium">后端闭源政策</text>
      <text class="mt-2 block text-xs text-orange-700 leading-relaxed">
        前端项目开源，blog-server 后端闭源。如需技术咨询或定制开发，请通过 Web 端「开源与合作」页联系。
      </text>
    </view>
  </view>
</template>

<style scoped>
.open-source-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

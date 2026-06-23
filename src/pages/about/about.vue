<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: '关于' },
})
</script>

<template>
  <scroll-view scroll-y class="about-page cyber-page-grid">
    <view class="px-4 py-6">
      <cyber-section-header
        label="ABOUT"
        title="Blog Home"
        subtitle="博客三端架构中的移动端前台"
        align="left"
      />
      <cyber-card class="mt-6 !p-4">
        <text class="block text-sm text-tech-muted leading-relaxed">
          基于 uni-app + Vue3 + TypeScript 构建，支持 H5、微信小程序与 App。
        </text>
        <text class="mt-4 block text-sm text-tech-muted leading-relaxed">
          功能涵盖文章阅读、用户中心、RPG 冒险玩法与实用工具，与 blog-home-nuxt 共享 blog-server 后端 API。
        </text>
      </cyber-card>
      <cyber-card class="mt-4 !p-4">
        <text class="block text-sm text-tech font-medium">技术栈</text>
        <view class="mt-3 flex flex-wrap gap-2">
          <text v-for="tag in ['uni-app', 'Vue 3', 'Pinia', 'wot-ui', 'UnoCSS', 'Socket.IO']" :key="tag" class="cyber-feature-tag">
            {{ tag }}
          </text>
        </view>
      </cyber-card>
    </view>
  </scroll-view>
</template>

<style scoped>
.about-page {
  height: 100vh;
}
</style>

<script lang="ts" setup>
/**
 * 项目展示页（对齐 blog-home-nuxt /projects）
 * - 多端演示链接；Zone 扫码图
 */
import { getProjectLinks, zoneDemoCards } from '@/config/site-config'
import { openExternalUrl } from '@/utils/open-external-url'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '项目展示' },
})

const projectLinks = getProjectLinks()

function openProject(url: string) {
  openExternalUrl(url)
}

function previewQr(url: string) {
  if (!url)
    return
  uni.previewImage({ urls: [url] })
}
</script>

<template>
  <scroll-view scroll-y class="projects-page">
    <view class="px-4 py-4">
      <text class="block text-lg font-bold">项目展示</text>
      <text class="mt-1 block text-sm text-gray-500">个人项目与作品演示</text>

      <view class="mt-6">
        <text class="mb-3 block font-medium">在线演示</text>
        <view
          v-for="item in projectLinks"
          :key="item.title"
          class="mb-3 rounded-lg bg-white p-4 shadow-sm"
        >
          <text class="block font-medium">{{ item.title }}</text>
          <text class="mt-1 block text-sm text-gray-500">{{ item.desc }}</text>
          <wd-button size="small" class="mt-3" @click="openProject(item.url)">
            <!-- #ifdef H5 -->在浏览器打开<!-- #endif -->
            <!-- #ifndef H5 -->复制链接<!-- #endif -->
          </wd-button>
        </view>
      </view>

      <view class="mt-6">
        <text class="mb-3 block font-medium">Zone 多端体验</text>
        <view class="grid grid-cols-2 gap-3">
          <view
            v-for="card in zoneDemoCards"
            :key="card.title"
            class="rounded-lg bg-white p-3 shadow-sm"
            @click="previewQr(card.image)"
          >
            <image :src="card.image" mode="aspectFit" class="h-28 w-full" />
            <text class="mt-2 block text-sm font-medium">{{ card.title }}</text>
            <text class="mt-1 block text-xs text-gray-500">{{ card.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

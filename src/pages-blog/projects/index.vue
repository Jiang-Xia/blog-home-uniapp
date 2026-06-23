<script lang="ts" setup>
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
  <scroll-view scroll-y class="projects-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-4">
      <cyber-section-header
        label="PROJECTS"
        title="项目展示"
        subtitle="个人项目与作品演示"
        align="left"
      />

      <view class="mt-6">
        <text class="mb-3 block text-tech font-medium">在线演示</text>
        <cyber-card
          v-for="item in projectLinks"
          :key="item.title"
          class="mb-3 !p-4"
        >
          <text class="block text-tech font-medium">{{ item.title }}</text>
          <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
          <cyber-button size="small" class="mt-3 inline-flex" variant="secondary" @click="openProject(item.url)">
            <!-- #ifdef H5 -->在浏览器打开<!-- #endif -->
            <!-- #ifndef H5 -->复制链接<!-- #endif -->
          </cyber-button>
        </cyber-card>
      </view>

      <view class="mt-6">
        <text class="mb-3 block text-tech font-medium">Zone 多端体验</text>
        <view class="u-grid-2">
          <view
            v-for="card in zoneDemoCards"
            :key="card.title"
            class="u-grid-2-item"
          >
            <cyber-card
              class="!p-3"
              @click="previewQr(card.image)"
            >
              <image :src="card.image" mode="aspectFit" class="h-28 w-full rounded-lg" />
              <text class="mt-2 block text-sm text-tech font-medium">{{ card.title }}</text>
              <text class="mt-1 block text-xs text-tech-muted">{{ card.desc }}</text>
            </cyber-card>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

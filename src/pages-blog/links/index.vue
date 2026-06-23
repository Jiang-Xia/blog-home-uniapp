<script lang="ts" setup>
import { getLinks } from '@/api/link'

definePage({
  style: { navigationBarTitleText: '友链' },
})

const links = ref<any[]>([])
const loading = ref(true)

onLoad(async () => {
  try {
    links.value = await getLinks() ?? []
  }
  finally {
    loading.value = false
  }
})

function openUrl(url: string) {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) })
  // #endif
}
</script>

<template>
  <scroll-view scroll-y class="links-page cyber-page-grid">
    <view class="px-4 py-3">
      <cyber-section-header
        class="mb-4"
        label="LINKS"
        title="友情链接"
        subtitle="发现更多优质博客与开发者站点"
        align="left"
      />

      <view v-if="loading" class="py-8 text-center text-tech-subtle">
        加载中...
      </view>
      <view v-else-if="!links.length" class="py-8 text-center text-tech-subtle">
        暂无友链
      </view>

      <cyber-card
        v-for="link in links"
        :key="link.id"
        class="mb-3 flex items-center gap-3 !p-3"
        @click="openUrl(link.url)"
      >
        <image v-if="link.avatar" :src="link.avatar" class="h-10 w-10 border border-tech rounded-full" />
        <view class="flex-1">
          <text class="block text-tech font-medium">{{ link.name }}</text>
          <text class="text-xs text-tech-muted">{{ link.description }}</text>
        </view>
      </cyber-card>
    </view>
  </scroll-view>
</template>

<style scoped>
.links-page {
  height: 100vh;
}
</style>

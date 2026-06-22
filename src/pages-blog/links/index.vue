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
  <view class="links-page px-4 py-3">
    <view v-if="loading" class="py-8 text-center text-gray-400">
      加载中...
    </view>
    <view v-else-if="!links.length" class="py-8 text-center text-gray-400">
      暂无友链
    </view>
    <view
      v-for="link in links"
      :key="link.id"
      class="mb-3 flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
      @click="openUrl(link.url)"
    >
      <image v-if="link.avatar" :src="link.avatar" class="h-10 w-10 rounded-full" />
      <view class="flex-1">
        <text class="block font-medium">{{ link.name }}</text>
        <text class="text-xs text-gray-500">{{ link.description }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.links-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

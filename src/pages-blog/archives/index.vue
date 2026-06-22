<script lang="ts" setup>
import dayjs from 'dayjs'
import { getArchives } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'

definePage({
  style: { navigationBarTitleText: '文章归档' },
})

const archivesList = ref<any[]>([])
const loading = ref(true)

onLoad(async () => {
  try {
    archivesList.value = await getArchives() ?? []
  }
  finally {
    loading.value = false
  }
})

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}
</script>

<template>
  <view class="archives-page px-4 py-3">
    <view v-if="loading" class="py-8 text-center text-gray-400">
      加载中...
    </view>
    <view v-else-if="!archivesList.length" class="py-8 text-center text-gray-400">
      暂无归档
    </view>
    <view v-for="(archive, idx) in archivesList" :key="idx" class="mb-4">
      <text class="mb-2 block text-lg font-bold">{{ archive.year }} 年</text>
      <view v-for="(articles, month) in archive.data" :key="month" class="mb-3">
        <text class="mb-1 block text-sm text-gray-500">{{ month }}</text>
        <view
          v-for="item in articles"
          :key="item.id"
          class="flex items-center gap-2 border-b border-gray-100 py-2"
          @click="goDetail(item.id)"
        >
          <text class="text-xs text-gray-400">{{ dayjs(item.createTime).format('MM-DD') }}</text>
          <text class="flex-1 text-sm">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.archives-page {
  min-height: 100vh;
  background: #fff;
}
</style>

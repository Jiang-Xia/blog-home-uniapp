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
  <scroll-view scroll-y class="archives-page cyber-page-grid">
    <view class="px-4 py-3">
      <cyber-section-header
        class="mb-4"
        label="ARCHIVES"
        title="文章归档"
        subtitle="按年月浏览全部文章"
        align="left"
      />

      <view v-if="loading" class="py-8 text-center text-tech-subtle">
        加载中...
      </view>
      <view v-else-if="!archivesList.length" class="py-8 text-center text-tech-subtle">
        暂无归档
      </view>

      <view v-for="(archive, idx) in archivesList" :key="idx" class="mb-4">
        <text class="mb-2 block text-lg text-tech font-bold">{{ archive.year }} 年</text>
        <cyber-card v-for="(articles, month) in archive.data" :key="month" class="mb-3 !p-3">
          <text class="mb-2 block text-sm text-tech-primary">{{ month }}</text>
          <view
            v-for="item in articles"
            :key="item.id"
            class="cyber-list-row"
            @click="goDetail(item.id)"
          >
            <text class="text-xs text-tech-subtle">{{ dayjs(item.createTime).format('MM-DD') }}</text>
            <text class="flex-1 text-sm text-tech">{{ item.title }}</text>
          </view>
        </cyber-card>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.archives-page {
  height: 100vh;
}
</style>

<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import ArticleCard from '@/components/article-card/article-card.vue'
import { ROUTE_SEARCH } from '@/router/routes'

definePage({
  type: 'home',
  style: { navigationBarTitleText: 'Blog Home' },
})

const articleList = ref<ArticleItem[]>([])
const pagingRef = ref<{ complete: (list: ArticleItem[]) => void, completeByTotal?: (list: ArticleItem[], total: number) => void } | null>(null)

async function queryList(pageNo: number, pageSize: number) {
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      sort: 'DESC',
      category: '',
      tags: [],
      title: '',
      description: '',
      content: '',
    })
    const list = res?.list ?? []
    const total = res?.pagination?.total ?? list.length
    pagingRef.value?.completeByTotal?.(list, total) ?? pagingRef.value?.complete(list)
  }
  catch {
    pagingRef.value?.complete([])
  }
}

function goSearch() {
  uni.navigateTo({ url: ROUTE_SEARCH })
}
</script>

<template>
  <z-paging ref="pagingRef" v-model="articleList" @query="queryList">
    <template #top>
      <view class="flex items-center justify-between bg-white px-4 py-3">
        <text class="text-lg font-bold">Blog Home</text>
        <text class="text-sm text-blue-600" @click="goSearch">搜索</text>
      </view>
    </template>
    <view class="px-3 py-2">
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
    </view>
  </z-paging>
</template>

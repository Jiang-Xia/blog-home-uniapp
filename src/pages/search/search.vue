<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import ArticleCard from '@/components/article-card/article-card.vue'

definePage({
  style: { navigationBarTitleText: '搜索' },
})

const keyword = ref('')
const articleList = ref<ArticleItem[]>([])
const pagingRef = ref<any>(null)

async function queryList(pageNo: number, pageSize: number) {
  if (!keyword.value.trim()) {
    pagingRef.value?.complete([])
    return
  }
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      sort: 'DESC',
      title: keyword.value,
      content: keyword.value,
    })
    const list = res?.list ?? []
    pagingRef.value?.completeByTotal?.(list, res?.pagination?.total ?? list.length)
  }
  catch {
    pagingRef.value?.complete([])
  }
}

function doSearch() {
  pagingRef.value?.reload()
}
</script>

<template>
  <z-paging ref="pagingRef" v-model="articleList" :auto="false" @query="queryList">
    <template #top>
      <view class="flex gap-2 bg-white px-3 py-2">
        <wd-input v-model="keyword" placeholder="搜索文章" clearable class="flex-1" />
        <wd-button size="small" @click="doSearch">
          搜索
        </wd-button>
      </view>
    </template>
    <view class="px-3 py-2">
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
    </view>
  </z-paging>
</template>

<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import { getTagById } from '@/api/tag'
import ArticleCard from '@/components/article-card/article-card.vue'

definePage({
  style: { navigationBarTitleText: '标签' },
})

const tagId = ref('')
const tagName = ref('')
const articleList = ref<ArticleItem[]>([])
const pagingRef = ref<any>(null)

onLoad(async (query) => {
  tagId.value = String(query?.id ?? '')
  if (tagId.value) {
    const tag = await getTagById(tagId.value)
    tagName.value = tag?.name ?? '标签'
    uni.setNavigationBarTitle({ title: tagName.value })
  }
})

async function queryList(pageNo: number, pageSize: number) {
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      tags: tagId.value ? [tagId.value] : [],
      sort: 'DESC',
    })
    const list = res?.list ?? []
    pagingRef.value?.completeByTotal?.(list, res?.pagination?.total ?? list.length)
  }
  catch {
    pagingRef.value?.complete([])
  }
}
</script>

<template>
  <z-paging ref="pagingRef" v-model="articleList" @query="queryList">
    <view class="px-3 py-2">
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
    </view>
  </z-paging>
</template>

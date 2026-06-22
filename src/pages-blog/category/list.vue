<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import { getCategoryById } from '@/api/category'
import ArticleCard from '@/components/article-card/article-card.vue'

definePage({
  style: { navigationBarTitleText: '分类' },
})

const categoryId = ref('')
const articleList = ref<ArticleItem[]>([])
const pagingRef = ref<any>(null)

onLoad(async (query) => {
  categoryId.value = String(query?.id ?? '')
  if (categoryId.value) {
    const cat = await getCategoryById(categoryId.value)
    uni.setNavigationBarTitle({ title: cat?.name ?? '分类' })
  }
})

async function queryList(pageNo: number, pageSize: number) {
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      category: categoryId.value,
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

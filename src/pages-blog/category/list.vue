<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import { getCategoryById } from '@/api/category'
import ArticleCard from '@/components/article-card/article-card.vue'
import { apiDisplayLabel } from '@/utils/display-label'

definePage({
  style: { navigationBarTitleText: '分类' },
})

const categoryId = ref('')
const categoryName = ref('')
const articleList = ref<ArticleItem[]>([])
const pagingRef = ref<any>(null)

onLoad(async (query) => {
  categoryId.value = String(query?.id ?? '')
  if (categoryId.value) {
    const cat = await getCategoryById(categoryId.value)
    categoryName.value = apiDisplayLabel(cat, '分类')
    uni.setNavigationBarTitle({ title: categoryName.value })
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
  <z-paging ref="pagingRef" v-model="articleList" bg-color="#050505" @query="queryList">
    <view class="u-page-body py-3">
      <cyber-section-header
        v-if="categoryName"
        class="mb-3"
        label="CATEGORY"
        :title="categoryName"
        align="left"
      />
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
    </view>
  </z-paging>
</template>

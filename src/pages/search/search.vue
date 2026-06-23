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
  <z-paging ref="pagingRef" v-model="articleList" bg-color="#050505" :auto="false" @query="queryList">
    <template #top>
      <view class="search-bar bg-tech-header border-b border-tech px-3 py-3">
        <view class="u-flex-row-center u-gap-2">
          <view class="u-flex-1">
            <input
              v-model="keyword"
              class="search-input"
              placeholder="输入标题或摘要"
              placeholder-class="search-placeholder"
              confirm-type="search"
              @confirm="doSearch"
            >
          </view>
          <cyber-button size="small" variant="secondary" @click="doSearch">
            搜索
          </cyber-button>
        </view>
      </view>
    </template>
    <view class="u-page-body py-3">
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
      <view v-if="keyword && !articleList.length" class="py-16 text-center text-tech-subtle">
        找不到相关文章
      </view>
    </view>
  </z-paging>
</template>

<style scoped lang="scss">
.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  border: 1px solid var(--tech-input-border);
  background-color: var(--tech-input-bg);
  color: var(--tech-fg);
  font-size: 28rpx;
}

.search-placeholder {
  color: var(--tech-fg-subtle);
}
</style>

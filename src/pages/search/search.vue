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
  const kw = keyword.value.trim()
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      sort: 'DESC',
      category: '',
      tags: [],
      title: kw,
      description: '',
      content: kw,
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
  <z-paging
    ref="pagingRef"
    v-model="articleList"
    bg-color="#050505"
    :default-page-size="10"
    @query="queryList"
  >
    <template #top>
      <view class="search-bar bg-tech-header border-b border-tech px-3 py-3">
        <view class="search-bar-row u-gap-2">
          <view class="search-input-wrap u-flex-1">
            <input
              v-model="keyword"
              class="search-input"
              placeholder="输入标题或摘要"
              placeholder-class="search-placeholder"
              confirm-type="search"
              @confirm="doSearch"
            >
          </view>
          <view class="search-submit-btn" @tap="doSearch">
            <text class="search-submit-text">搜索</text>
          </view>
        </view>
      </view>
    </template>
    <view class="u-page-body py-3">
      <text v-if="!keyword.trim()" class="search-hint mb-3 block text-xs text-tech-subtle">
        默认展示最新 10 篇文章，输入关键词后按标题/正文搜索
      </text>
      <ArticleCard v-for="item in articleList" :key="item.id" :item="item" layout="compact" />
      <view v-if="keyword.trim() && !articleList.length" class="py-16 text-center text-tech-subtle">
        找不到相关文章
      </view>
    </view>
  </z-paging>
</template>

<style scoped lang="scss">
.search-bar-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.search-input-wrap {
  min-width: 0;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  border: 1px solid var(--tech-input-border);
  background-color: var(--tech-input-bg);
  color: var(--tech-fg);
  font-size: 28rpx;
  box-sizing: border-box;
}

.search-placeholder {
  color: var(--tech-fg-subtle);
}

.search-submit-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  padding: 0 28rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(34, 211, 238, 0.45);
  background: rgba(34, 211, 238, 0.12);
  box-sizing: border-box;
}

.search-submit-btn:active {
  background: rgba(34, 211, 238, 0.2);
}

.search-submit-text {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--tech-primary);
  line-height: 1;
}
</style>

<script lang="ts" setup>
/**
 * 用户收藏列表（对齐 blog-home-nuxt components/user/collect-list.vue）
 * 数据来源：GET /collect/list
 */
import { getMyCollectList } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'
import { beforeTimeNow } from '@/utils/date-time'
import { apiDisplayLabel } from '@/utils/display-label'

const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const hasMore = ref(true)

const STATUS_MAP: Record<string, { label: string, tone: string }> = {
  publish: { label: '已发布', tone: 'success' },
  draft: { label: '草稿', tone: '' },
  scheduled: { label: '定时发布', tone: 'warning' },
}

function getArticle(item: any) {
  return item.article
}

function getStatusBadge(article: any) {
  if (!article)
    return { label: '已删除', tone: 'error' }
  if (article.isDelete)
    return { label: '已禁用', tone: 'error' }
  return STATUS_MAP[article.status] || { label: article.status, tone: '' }
}

function canVisit(article: any) {
  return article?.status === 'publish' && !article?.isDelete
}

function getTagLabels(article: any) {
  return (article?.tags || [])
    .map((tag: { label?: string, name?: string }) => apiDisplayLabel(tag))
    .filter(Boolean)
}

function categoryLabel(article: any) {
  return apiDisplayLabel(article?.category)
}

function formatCollectTime(item: any) {
  const t = item.createTime ? new Date(item.createTime).getTime() : 0
  return beforeTimeNow(t)
}

async function loadData() {
  if (loading.value || !hasMore.value)
    return
  loading.value = true
  try {
    const res = await getMyCollectList({ page: page.value, pageSize })
    const items = res?.list || []
    const pagination = res?.pagination || {}
    list.value = [...list.value, ...items]
    total.value = pagination.total || 0
    hasMore.value = list.value.length < total.value
    page.value++
  }
  catch {
    // 全局拦截器处理
  }
  finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function onItemClick(item: any) {
  const article = getArticle(item)
  if (canVisit(article))
    goDetail(article.id || item.articleId)
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <view>
    <view v-if="loading && list.length === 0" class="user-list-state">
      <text class="text-sm text-tech-muted">加载中...</text>
    </view>

    <view v-else-if="list.length === 0" class="user-list-state">
      <text class="user-list-state__emoji">📭</text>
      <text class="text-sm text-tech-muted">还没有收藏文章</text>
    </view>

    <view v-else>
      <view
        v-for="item in list"
        :key="item.id"
        class="user-list-row"
        @click="onItemClick(item)"
      >
        <view
          class="user-list-row__main"
          :class="canVisit(getArticle(item)) ? '' : 'opacity-80'"
        >
          <text
            class="user-list-row__title"
            :class="canVisit(getArticle(item)) ? '' : 'user-list-row__title--muted'"
          >
            {{ getArticle(item)?.title || '文章已删除' }}
          </text>
          <text v-if="getArticle(item)?.description" class="user-list-row__desc">
            {{ getArticle(item).description }}
          </text>
          <view class="user-list-row__badges u-gap-2 u-flex-row-center flex-wrap">
            <text
              class="user-status-badge"
              :class="getStatusBadge(getArticle(item)).tone ? `user-status-badge--${getStatusBadge(getArticle(item)).tone}` : ''"
            >
              {{ getStatusBadge(getArticle(item)).label }}
            </text>
            <text v-if="getArticle(item)?.topping" class="user-status-badge user-status-badge--primary">置顶</text>
            <text v-if="categoryLabel(getArticle(item))" class="user-status-badge user-status-badge--secondary">
              {{ categoryLabel(getArticle(item)) }}
            </text>
            <text
              v-for="(label, index) in getTagLabels(getArticle(item))"
              :key="`${item.id}-tag-${index}`"
              class="user-status-badge"
            >
              {{ label }}
            </text>
          </view>
          <view class="user-list-row__meta">
            <text>{{ formatCollectTime(item) }}收藏</text>
            <template v-if="canVisit(getArticle(item))">
              <text class="user-list-row__dot">·</text>
              <text>{{ getArticle(item)?.views ?? 0 }} 阅读</text>
              <text class="user-list-row__dot">·</text>
              <text>{{ getArticle(item)?.likes ?? 0 }} 点赞</text>
            </template>
          </view>
        </view>
      </view>

      <view v-if="hasMore" class="user-list-more">
        <cyber-button size="small" variant="secondary" :disabled="loading" @click="loadData">
          {{ loading ? '加载中...' : '加载更多' }}
        </cyber-button>
      </view>
      <view v-else-if="list.length > 0" class="user-list-footer">
        已显示全部 {{ total }} 条收藏
      </view>
    </view>
  </view>
</template>

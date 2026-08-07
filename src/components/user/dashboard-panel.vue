<script lang="ts" setup>
/**
 * 个人中心 · 创作数据看板（对齐 blog-home-nuxt components/user/dashboard-panel.vue）
 * 数据来源：GET /article/author-stats
 */
import { getAuthorStats } from '@/api/author'
import { ROUTE_ARTICLE_EDIT, ROUTE_DETAIL } from '@/router/routes'
import { beforeTimeNow } from '@/utils/date-time'

const loading = ref(true)
const stats = ref<any>(null)

const statCards = computed(() => {
  if (!stats.value)
    return []
  return [
    { key: 'published', label: '已发布', value: stats.value.published, tone: 'primary' },
    { key: 'draft', label: '草稿', value: stats.value.draft, tone: '' },
    { key: 'scheduled', label: '定时', value: stats.value.scheduled, tone: '' },
    { key: 'totalViews', label: '总阅读', value: stats.value.totalViews, tone: 'cyan' },
    { key: 'totalLikes', label: '总点赞', value: stats.value.totalLikes, tone: 'pink' },
  ]
})

const maxViews = computed(() => {
  const rows = stats.value?.topArticles ?? []
  return Math.max(...rows.map((item: any) => item.views || 0), 1)
})

function viewPercent(views: number | string | undefined) {
  return Math.max(8, Math.round(((Number(views) || 0) / maxViews.value) * 100))
}

function formatRank(index: number | string) {
  return String(Number(index) + 1).padStart(2, '0')
}

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function goWrite() {
  uni.navigateTo({ url: ROUTE_ARTICLE_EDIT })
}

onMounted(async () => {
  try {
    stats.value = await getAuthorStats()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <view>
    <view v-if="loading" class="user-list-state">
      <text class="text-sm text-tech-muted">同步创作数据中...</text>
    </view>

    <template v-else-if="stats">
      <view class="user-dashboard-stats">
        <view
          v-for="card in statCards"
          :key="card.key"
          class="user-dashboard-stat"
          :class="card.tone ? `user-dashboard-stat--${card.tone}` : ''"
        >
          <text class="user-dashboard-stat__value">{{ card.value ?? 0 }}</text>
          <text class="user-dashboard-stat__label">{{ card.label }}</text>
        </view>
      </view>

      <view v-if="stats.topArticles?.length" class="user-dashboard-top">
        <text class="cyber-section-label">TOP ARTICLES</text>
        <text class="user-dashboard-top__title">热门文章排行</text>

        <view class="u-stack-3">
          <view
            v-for="(item, index) in stats.topArticles"
            :key="item.id"
            class="user-dashboard-top-item"
            @click="goDetail(item.id)"
          >
            <text class="user-dashboard-top-item__rank">{{ formatRank(index) }}</text>
            <view class="u-flex-1 min-w-0">
              <text class="user-dashboard-top-item__title">{{ item.title }}</text>
              <view class="user-dashboard-top-item__meta u-gap-2 u-flex-row-center flex-wrap">
                <text>{{ item.views ?? 0 }} 阅读</text>
                <text>{{ item.likes ?? 0 }} 点赞</text>
                <text v-if="item.createTime" class="user-dashboard-top-item__time">
                  {{ beforeTimeNow(new Date(item.createTime).getTime()) }}
                </text>
              </view>
              <view class="user-dashboard-top-item__bar">
                <view
                  class="user-dashboard-top-item__bar-fill"
                  :style="{ width: `${viewPercent(item.views)}%` }"
                />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="user-list-state cyber-glass-card">
        <cyber-icon name="book" size="56rpx" />
        <text class="mt-2 block text-sm text-tech-muted">还没有已发布文章，去写一篇吧</text>
        <view class="mt-3">
          <cyber-button size="small" variant="secondary" @click="goWrite">
            开始创作
          </cyber-button>
        </view>
      </view>
    </template>
  </view>
</template>

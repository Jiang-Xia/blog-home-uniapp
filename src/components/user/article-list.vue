<script lang="ts" setup>
/**
 * 用户文章列表（对齐 blog-home-nuxt components/user/article-list.vue）
 * - 分页 GET /article/my-list
 * - 客户端 status/标题筛选；badge 文案本地映射
 */
import { disableArticle, getMyArticleList } from '@/api/article'
import { ROUTE_ARTICLE_EDIT, ROUTE_DETAIL } from '@/router/routes'
import { beforeTimeNow } from '@/utils/date-time'
import { apiDisplayLabel } from '@/utils/display-label'

const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const hasMore = ref(true)
const statusFilter = ref<'all' | 'publish' | 'draft' | 'scheduled'>('all')
const titleKeyword = ref('')
const deletingId = ref<number | null>(null)

const statusTabs = [
  { key: 'all' as const, label: '全部' },
  { key: 'publish' as const, label: '已发布' },
  { key: 'draft' as const, label: '草稿' },
  { key: 'scheduled' as const, label: '定时' },
]

const STATUS_MAP: Record<string, { label: string, tone: string }> = {
  publish: { label: '已发布', tone: 'success' },
  draft: { label: '草稿', tone: '' },
  scheduled: { label: '定时发布', tone: 'warning' },
}

const filteredList = computed(() => {
  let rows = list.value
  if (statusFilter.value !== 'all')
    rows = rows.filter(item => item.status === statusFilter.value)
  const kw = titleKeyword.value.trim().toLowerCase()
  if (kw)
    rows = rows.filter(item => (item.title || '').toLowerCase().includes(kw))
  return rows
})

function getStatusBadge(item: any) {
  return STATUS_MAP[item.status] || { label: item.status, tone: '' }
}

function canVisit(item: any) {
  return item.status === 'publish'
}

function getTagLabels(item: any) {
  return (item.tags || [])
    .map((tag: { label?: string, name?: string }) => apiDisplayLabel(tag))
    .filter(Boolean)
}

function categoryLabel(item: any) {
  return apiDisplayLabel(item.category)
}

function formatTime(item: any) {
  const t = item.createTime ? new Date(item.createTime).getTime() : 0
  return beforeTimeNow(t)
}

async function loadData() {
  if (loading.value || !hasMore.value)
    return
  loading.value = true
  try {
    const res = await getMyArticleList({ page: page.value, pageSize })
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

function goEdit(id: number) {
  uni.navigateTo({ url: `${ROUTE_ARTICLE_EDIT}?id=${id}` })
}

function handleDelete(item: { id: number, title?: string }) {
  uni.showModal({
    title: '删除文章',
    content: `确定删除「${item.title || '未命名文章'}」吗？删除后将不再对外展示。`,
    confirmColor: '#dc2626',
    success: async (res) => {
      if (!res.confirm)
        return
      deletingId.value = item.id
      try {
        await disableArticle(item.id, true)
        list.value = list.value.filter(row => row.id !== item.id)
        total.value = Math.max(0, total.value - 1)
        uni.showToast({ title: '文章已删除', icon: 'success' })
      }
      catch {
        uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
      }
      finally {
        deletingId.value = null
      }
    },
  })
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
      <text class="user-list-state__emoji">📝</text>
      <text class="text-sm text-tech-muted">还没有编写文章</text>
    </view>

    <view v-else>
      <scroll-view scroll-x class="cyber-tabs user-article-filter">
        <view class="cyber-tabs-inner u-gap-2 flex px-1 py-2">
          <view v-for="tab in statusTabs" :key="tab.key" class="cyber-tabs-item">
            <text
              class="cyber-tab shrink-0"
              :class="statusFilter === tab.key ? 'cyber-tab-active' : ''"
              @click="statusFilter = tab.key"
            >
              {{ tab.label }}
            </text>
          </view>
        </view>
      </scroll-view>

      <view class="user-article-search">
        <wd-input v-model="titleKeyword" placeholder="搜索标题..." clearable />
      </view>

      <view v-if="filteredList.length === 0" class="user-list-state">
        <text class="text-sm text-tech-muted">没有匹配的文章</text>
      </view>

      <view v-for="item in filteredList" :key="item.id" class="user-list-row">
        <view
          class="user-list-row__main"
          :class="canVisit(item) ? '' : 'opacity-80'"
          @click="canVisit(item) && goDetail(item.id)"
        >
          <text class="user-list-row__title">{{ item.title }}</text>
          <text v-if="item.description" class="user-list-row__desc">{{ item.description }}</text>
          <view class="user-list-row__badges u-gap-2 u-flex-row-center flex-wrap">
            <text
              class="user-status-badge"
              :class="getStatusBadge(item).tone ? `user-status-badge--${getStatusBadge(item).tone}` : ''"
            >
              {{ getStatusBadge(item).label }}
            </text>
            <text v-if="item.topping" class="user-status-badge user-status-badge--primary">置顶</text>
            <text v-if="categoryLabel(item)" class="user-status-badge user-status-badge--secondary">
              {{ categoryLabel(item) }}
            </text>
            <text
              v-for="(label, index) in getTagLabels(item)"
              :key="`${item.id}-tag-${index}`"
              class="user-status-badge"
            >
              {{ label }}
            </text>
          </view>
          <view class="user-list-row__meta">
            <text>{{ formatTime(item) }}</text>
            <template v-if="canVisit(item)">
              <text class="user-list-row__dot">·</text>
              <text>{{ item.views ?? 0 }} 阅读</text>
              <text class="user-list-row__dot">·</text>
              <text>{{ item.likes ?? 0 }} 点赞</text>
            </template>
          </view>
        </view>
        <view class="user-list-row__actions">
          <view>
            <cyber-button size="small" variant="secondary" @click="goEdit(item.id)">
              编辑
            </cyber-button>
          </view>
          <view>
            <cyber-button
              size="small"
              variant="secondary"
              :disabled="deletingId === item.id"
              @click="handleDelete(item)"
            >
              {{ deletingId === item.id ? '删除中...' : '删除' }}
            </cyber-button>
          </view>
        </view>
      </view>

      <view v-if="hasMore" class="user-list-more">
        <cyber-button size="small" variant="secondary" :disabled="loading" @click="loadData">
          {{ loading ? '加载中...' : '加载更多' }}
        </cyber-button>
      </view>
      <view v-else-if="list.length > 0" class="user-list-footer">
        已显示全部 {{ total }} 篇文章
      </view>
    </view>
  </view>
</template>

<style scoped>
.user-article-filter {
  margin-bottom: 16rpx;
}

.user-article-search {
  margin-bottom: 24rpx;
}
</style>

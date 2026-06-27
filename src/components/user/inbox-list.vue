<script lang="ts" setup>
/**
 * 个人中心 · 评论收件箱（对齐 blog-home-nuxt components/user/inbox-list.vue）
 * 数据来源：GET /comment/on-my-articles；status 字段直接渲染
 */
import { getCommentsOnMyArticles } from '@/api/author'
import { ROUTE_DETAIL } from '@/router/routes'
import { beforeTimeNow } from '@/utils/date-time'
import { resolveStaticUrl } from '@/utils/static-url'

const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const hasMore = ref(true)

const pendingCount = computed(
  () => list.value.filter(item => item.status === 'pending').length,
)

function formatTime(timeStr?: string) {
  if (!timeStr)
    return ''
  return beforeTimeNow(new Date(timeStr).getTime())
}

function avatarUrl(item: any) {
  return resolveStaticUrl(item.userInfo?.avatar || '')
}

async function loadData() {
  if (loading.value || !hasMore.value)
    return
  loading.value = true
  try {
    const res = await getCommentsOnMyArticles({ page: page.value, pageSize: 10 })
    const items = res?.list ?? []
    list.value = [...list.value, ...items]
    total.value = res?.pagination?.total ?? list.value.length
    hasMore.value = list.value.length < total.value
    page.value += 1
  }
  finally {
    loading.value = false
  }
}

function goDetail(articleId: number | string) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${articleId}` })
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <view>
    <view v-if="list.length" class="u-gap-2 u-flex-row-center user-inbox-summary flex-wrap">
      <text class="user-inbox-chip">共 {{ total || list.length }} 条</text>
      <text v-if="pendingCount" class="user-inbox-chip user-inbox-chip--warn">
        {{ pendingCount }} 条待审核
      </text>
    </view>

    <view v-if="loading && !list.length" class="user-list-state">
      <text class="text-sm text-tech-muted">加载评论收件箱...</text>
    </view>

    <view v-else-if="!list.length" class="user-list-state cyber-glass-card">
      <cyber-icon name="comment" size="60rpx" />
      <text class="mt-3 block text-sm text-tech font-medium">暂无收到的评论</text>
      <text class="mt-1 block text-xs text-tech-muted">读者在你的文章下留言后会出现在这里</text>
    </view>

    <view v-else class="u-stack-3">
      <view
        v-for="item in list"
        :key="item.id"
        class="user-inbox-item"
        :class="item.status === 'pending' ? 'user-inbox-item--pending' : ''"
      >
        <view class="user-inbox-item__head u-gap-3 u-flex-row-center">
          <view class="user-inbox-item__avatar">
            <image
              v-if="item.userInfo?.avatar"
              :src="avatarUrl(item)"
              class="user-inbox-item__avatar-img"
              mode="aspectFill"
            />
            <cyber-icon v-else name="user" size="32rpx" />
          </view>
          <view class="u-flex-1 min-w-0">
            <text class="user-inbox-item__author">{{ item.userInfo?.nickname || '匿名用户' }}</text>
            <text v-if="item.createTime" class="user-inbox-item__time">{{ formatTime(item.createTime) }}</text>
          </view>
          <text
            class="user-inbox-item__status"
            :class="item.status === 'pending' ? 'user-inbox-item__status--pending' : 'user-inbox-item__status--approved'"
          >
            {{ item.status === 'pending' ? '待审核' : '已通过' }}
          </text>
        </view>

        <text class="user-inbox-item__content">{{ item.content }}</text>

        <view
          v-if="item.articleId"
          class="user-inbox-item__article u-gap-2 u-flex-row-center"
          @click="goDetail(item.articleId)"
        >
          <cyber-icon name="book" size="28rpx" />
          <text class="user-inbox-item__article-title">{{ item.articleTitle || '查看文章' }}</text>
        </view>
      </view>
    </view>

    <view v-if="hasMore && list.length" class="user-list-more">
      <cyber-button size="small" variant="secondary" :disabled="loading" @click="loadData">
        {{ loading ? '加载中...' : '加载更多' }}
      </cyber-button>
    </view>
    <view v-else-if="list.length" class="user-list-footer">
      已显示全部 {{ total || list.length }} 条评论
    </view>
  </view>
</template>

<style scoped>
.user-inbox-summary {
  margin-bottom: 24rpx;
}
</style>

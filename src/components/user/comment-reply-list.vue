<script lang="ts" setup>
/**
 * 用户评论/回复列表（对齐 blog-home-nuxt components/user/comment-reply-list.vue）
 * 数据来源：GET /comment/my-list、GET /reply/my-list
 */
import { getMyComments, getMyReplies } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'
import { beforeTimeNow } from '@/utils/date-time'

const activeTab = ref<'comment' | 'reply'>('comment')

const commentLoading = ref(false)
const commentList = ref<any[]>([])
const commentPage = ref(1)
const commentPageSize = 10
const commentTotal = ref(0)
const commentHasMore = ref(true)

const replyLoading = ref(false)
const replyList = ref<any[]>([])
const replyPage = ref(1)
const replyPageSize = 10
const replyTotal = ref(0)
const replyHasMore = ref(true)

function formatTime(timeStr: string) {
  const t = timeStr ? new Date(timeStr).getTime() : 0
  return beforeTimeNow(t)
}

function truncate(text: string, maxLen = 60) {
  if (!text)
    return ''
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
}

async function loadComments() {
  if (commentLoading.value || !commentHasMore.value)
    return
  commentLoading.value = true
  try {
    const res = await getMyComments({ page: commentPage.value, pageSize: commentPageSize })
    const items = res?.list || []
    const pagination = res?.pagination || {}
    commentList.value = [...commentList.value, ...items]
    commentTotal.value = pagination.total || 0
    commentHasMore.value = commentList.value.length < commentTotal.value
    commentPage.value++
  }
  catch {
    // 全局拦截器处理
  }
  finally {
    commentLoading.value = false
  }
}

async function loadReplies() {
  if (replyLoading.value || !replyHasMore.value)
    return
  replyLoading.value = true
  try {
    const res = await getMyReplies({ page: replyPage.value, pageSize: replyPageSize })
    const items = res?.list || []
    const pagination = res?.pagination || {}
    replyList.value = [...replyList.value, ...items]
    replyTotal.value = pagination.total || 0
    replyHasMore.value = replyList.value.length < replyTotal.value
    replyPage.value++
  }
  catch {
    // 全局拦截器处理
  }
  finally {
    replyLoading.value = false
  }
}

function goDetail(articleId: number | string) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${articleId}` })
}

watch(activeTab, (val) => {
  if (val === 'comment' && commentList.value.length === 0)
    void loadComments()
  else if (val === 'reply' && replyList.value.length === 0)
    void loadReplies()
})

onMounted(() => {
  void loadComments()
  getMyReplies({ page: 1, pageSize: 1 })
    .then((res) => {
      replyTotal.value = res?.pagination?.total || 0
    })
    .catch(() => {})
})
</script>

<template>
  <view>
    <view class="user-comment-reply-list__tabs u-gap-2 u-flex-row-center">
      <view>
        <cyber-button
          size="small"
          :variant="activeTab === 'comment' ? 'primary' : 'secondary'"
          @click="activeTab = 'comment'"
        >
          评论 ({{ commentTotal }})
        </cyber-button>
      </view>
      <view>
        <cyber-button
          size="small"
          :variant="activeTab === 'reply' ? 'primary' : 'secondary'"
          @click="activeTab = 'reply'"
        >
          回复 ({{ replyTotal }})
        </cyber-button>
      </view>
    </view>

    <view v-show="activeTab === 'comment'">
      <view v-if="commentLoading && commentList.length === 0" class="user-list-state">
        <text class="text-sm text-tech-muted">加载中...</text>
      </view>
      <view v-else-if="commentList.length === 0" class="user-list-state">
        <text class="user-list-state__emoji">💬</text>
        <text class="text-sm text-tech-muted">还没有发表评论</text>
      </view>
      <view v-else>
        <view v-for="item in commentList" :key="item.id" class="user-comment-item">
          <text class="user-comment-item__content">{{ item.content }}</text>
          <view class="user-comment-item__meta u-gap-2 u-flex-row-center flex-wrap">
            <text
              v-if="item.articleId"
              class="user-comment-item__link"
              @click="goDetail(item.articleId)"
            >
              {{ item.articleTitle || '查看文章' }}
            </text>
            <text class="text-xs text-tech-subtle">{{ formatTime(item.createTime) }}</text>
          </view>
        </view>
        <view v-if="commentHasMore" class="user-list-more">
          <cyber-button size="small" variant="secondary" :disabled="commentLoading" @click="loadComments">
            {{ commentLoading ? '加载中...' : '加载更多' }}
          </cyber-button>
        </view>
        <view v-else class="user-list-footer">
          已显示全部 {{ commentTotal }} 条评论
        </view>
      </view>
    </view>

    <view v-show="activeTab === 'reply'">
      <view v-if="replyLoading && replyList.length === 0" class="user-list-state">
        <text class="text-sm text-tech-muted">加载中...</text>
      </view>
      <view v-else-if="replyList.length === 0" class="user-list-state">
        <text class="user-list-state__emoji">↩️</text>
        <text class="text-sm text-tech-muted">还没有发表回复</text>
      </view>
      <view v-else>
        <view v-for="item in replyList" :key="item.id" class="user-comment-item">
          <text class="user-comment-item__content">{{ item.content }}</text>
          <text v-if="item.parentCommentContent" class="user-comment-item__parent">
            {{ truncate(item.parentCommentContent) }}
          </text>
          <view class="user-comment-item__meta u-gap-2 u-flex-row-center flex-wrap">
            <text
              v-if="item.articleId"
              class="user-comment-item__link"
              @click="goDetail(item.articleId)"
            >
              {{ item.articleTitle || '查看文章' }}
            </text>
            <text class="text-xs text-tech-subtle">{{ formatTime(item.createTime) }}</text>
          </view>
        </view>
        <view v-if="replyHasMore" class="user-list-more">
          <cyber-button size="small" variant="secondary" :disabled="replyLoading" @click="loadReplies">
            {{ replyLoading ? '加载中...' : '加载更多' }}
          </cyber-button>
        </view>
        <view v-else class="user-list-footer">
          已显示全部 {{ replyTotal }} 条回复
        </view>
      </view>
    </view>
  </view>
</template>

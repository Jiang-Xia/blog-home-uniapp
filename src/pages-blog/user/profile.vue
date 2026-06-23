<script lang="ts" setup>
/**
 * 个人中心（六 Tab）
 * - 资料：头像上传 + PATCH /user/edit
 * - 文章：编辑 / 下架 DELETE /article/disabled
 * - 评论 Tab：我的评论 + 我的回复 子标签
 */
import { disableArticle, getMyArticleList, getMyCollectList, getMyComments, getMyReplies } from '@/api/article'
import { getAuthorStats, getCommentsOnMyArticles } from '@/api/author'
import { getNotificationList, markAllNotificationsRead, markNotificationRead } from '@/api/notification'
import { updateUserProfile, uploadAvatar } from '@/api/resources'
import { ROUTE_ARTICLE_EDIT } from '@/router/routes'
import ArticleCard from '@/components/article-card/article-card.vue'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: { navigationBarTitleText: '个人中心' },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const activeTab = ref<'card' | 'article' | 'collect' | 'comment' | 'inbox' | 'dashboard'>('card')
const commentSubTab = ref<'comment' | 'reply'>('comment')
const articles = ref<any[]>([])
const collects = ref<any[]>([])
const comments = ref<any[]>([])
const replies = ref<any[]>([])
const notifications = ref<any[]>([])
const authorStats = ref<any>(null)
const inboxComments = ref<any[]>([])
const avatarUploading = ref(false)
const deletingArticleId = ref<number | null>(null)

const avatarDisplayUrl = computed(() => resolveStaticUrl(userStore.userInfo.avatar || ''))

const tabs = [
  { key: 'card', label: '资料' },
  { key: 'article', label: '文章' },
  { key: 'collect', label: '收藏' },
  { key: 'comment', label: '评论' },
  { key: 'inbox', label: '收件箱' },
  { key: 'dashboard', label: '看板' },
] as const

onShow(async () => {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  await loadTabData()
})

/** 按当前 Tab 懒加载数据 */
async function loadTabData() {
  switch (activeTab.value) {
    case 'article':
      articles.value = (await getMyArticleList({ page: 1, pageSize: 20 }))?.list ?? []
      break
    case 'collect':
      collects.value = (await getMyCollectList({ page: 1, pageSize: 20 }))?.list ?? []
      break
    case 'comment':
      if (commentSubTab.value === 'comment') {
        comments.value = (await getMyComments({ page: 1, pageSize: 20 }))?.list ?? []
      }
      else {
        replies.value = (await getMyReplies({ page: 1, pageSize: 20 }))?.list ?? []
      }
      break
    case 'inbox':
      notifications.value = (await getNotificationList({ page: 1, pageSize: 30 }))?.list ?? []
      inboxComments.value = (await getCommentsOnMyArticles({ page: 1, pageSize: 20 }))?.list ?? []
      break
    case 'dashboard':
      authorStats.value = await getAuthorStats()
      break
  }
}

watch(activeTab, () => {
  void loadTabData()
})

watch(commentSubTab, () => {
  if (activeTab.value === 'comment')
    void loadTabData()
})

/** 选择并上传头像 */
function pickAvatar() {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const path = res.tempFilePaths[0]
      if (!path)
        return
      avatarUploading.value = true
      try {
        const relative = await uploadAvatar(path)
        userStore.userInfo.avatar = resolveStaticUrl(relative)
        uni.showToast({ title: '头像已更新', icon: 'success' })
      }
      catch {
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
      finally {
        avatarUploading.value = false
      }
    },
  })
}

async function saveProfile() {
  const u = userStore.userInfo
  await updateUserProfile({
    id: u.userId,
    nickname: u.nickname,
    intro: u.intro as string,
    homepage: u.homepage as string,
    avatar: u.avatar,
  })
  uni.showToast({ title: '已保存', icon: 'success' })
}

/** 软删除文章 PATCH /article/disabled */
function confirmDeleteArticle(item: { id: number, title?: string }) {
  uni.showModal({
    title: '删除文章',
    content: `确定删除「${item.title || '未命名文章'}」吗？删除后将不再对外展示。`,
    confirmText: '删除',
    confirmColor: '#dc2626',
    success: async (res) => {
      if (!res.confirm)
        return
      deletingArticleId.value = item.id
      try {
        await disableArticle(item.id, true)
        articles.value = articles.value.filter(row => row.id !== item.id)
        uni.showToast({ title: '文章已删除', icon: 'success' })
      }
      catch {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
      finally {
        deletingArticleId.value = null
      }
    },
  })
}

async function readNotification(id: number) {
  await markNotificationRead([id])
  void loadTabData()
}

async function readAllNotifications() {
  await markAllNotificationsRead()
  void loadTabData()
}

function goWriteArticle() {
  uni.navigateTo({ url: ROUTE_ARTICLE_EDIT })
}

function goEditArticle(id: number) {
  uni.navigateTo({ url: `${ROUTE_ARTICLE_EDIT}?id=${id}` })
}
</script>

<template>
  <view class="profile-page cyber-page-grid">
    <scroll-view scroll-x class="cyber-tabs">
      <view class="flex px-2 py-2">
        <text
          v-for="tab in tabs"
          :key="tab.key"
          class="cyber-tab mr-4 shrink-0"
          :class="activeTab === tab.key ? 'cyber-tab-active' : ''"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </text>
      </view>
    </scroll-view>

    <view v-if="activeTab === 'card'" class="p-4">
      <cyber-card class="mb-4 !p-4">
        <view class="flex items-center gap-3">
          <image :src="avatarDisplayUrl" class="h-16 w-16 border border-tech rounded-full" mode="aspectFill" />
          <view class="flex-1">
            <text class="block text-tech font-bold">{{ userStore.userInfo.nickname }}</text>
            <text class="text-sm text-tech-muted">@{{ userStore.userInfo.username }}</text>
            <wd-button size="small" class="mt-2" :loading="avatarUploading" @click="pickAvatar">
              更换头像
            </wd-button>
          </view>
        </view>
      </cyber-card>
      <wd-input v-model="userStore.userInfo.nickname" label="昵称" />
      <wd-input v-model="userStore.userInfo.intro" label="简介" />
      <wd-input v-model="userStore.userInfo.homepage" label="主页" />
      <cyber-button block class="mt-4" variant="primary" @click="saveProfile">
        保存资料
      </cyber-button>
    </view>

    <view v-else-if="activeTab === 'article'" class="p-3">
      <cyber-button size="small" class="mb-3 inline-flex" variant="secondary" @click="goWriteArticle">
        ✍️ 写文章
      </cyber-button>
      <cyber-card v-for="item in articles" :key="item.id" class="mb-3 !p-2">
        <ArticleCard :item="item" />
        <view class="mt-2 flex gap-2">
          <wd-button size="small" @click.stop="goEditArticle(item.id)">
            编辑
          </wd-button>
          <wd-button
            size="small"
            custom-class="delete-btn"
            :loading="deletingArticleId === item.id"
            @click.stop="confirmDeleteArticle(item)"
          >
            删除
          </wd-button>
        </view>
      </cyber-card>
    </view>

    <view v-else-if="activeTab === 'collect'" class="p-3">
      <ArticleCard v-for="item in collects" :key="item.id" :item="item" />
    </view>

    <view v-else-if="activeTab === 'comment'" class="p-3">
      <view class="mb-3 flex gap-3">
        <text
          class="cyber-tab"
          :class="commentSubTab === 'comment' ? 'cyber-tab-active' : ''"
          @click="commentSubTab = 'comment'"
        >
          我的评论
        </text>
        <text
          class="cyber-tab"
          :class="commentSubTab === 'reply' ? 'cyber-tab-active' : ''"
          @click="commentSubTab = 'reply'"
        >
          我的回复
        </text>
      </view>
      <template v-if="commentSubTab === 'comment'">
        <view v-for="c in comments" :key="c.id" class="mb-3 border-b border-tech pb-2">
          <text class="block text-sm text-tech">{{ c.content }}</text>
          <text v-if="c.articleTitle" class="mt-1 block text-xs text-tech-subtle">{{ c.articleTitle }}</text>
        </view>
        <view v-if="!comments.length" class="py-8 text-center text-sm text-tech-subtle">
          暂无评论
        </view>
      </template>
      <template v-else>
        <view v-for="r in replies" :key="r.id" class="mb-3 border-b border-tech pb-2">
          <text class="block text-sm text-tech">{{ r.content }}</text>
          <text v-if="r.parentContent" class="mt-1 block text-xs text-tech-subtle">回复：{{ r.parentContent }}</text>
        </view>
        <view v-if="!replies.length" class="py-8 text-center text-sm text-tech-subtle">
          暂无回复
        </view>
      </template>
    </view>

    <view v-else-if="activeTab === 'inbox'" class="p-3">
      <cyber-button size="small" class="inline-flex" variant="secondary" @click="readAllNotifications">
        全部已读
      </cyber-button>
      <cyber-card v-for="n in notifications" :key="n.id" class="mt-2 !p-3" @click="readNotification(n.id)">
        <text class="text-sm text-tech-muted">{{ n.title || n.content }}</text>
      </cyber-card>
      <text class="mt-4 block text-tech font-medium">文章评论</text>
      <view v-for="c in inboxComments" :key="c.id" class="mt-2 border-b border-tech pb-2">
        <text class="text-sm text-tech-muted">{{ c.content }}</text>
      </view>
    </view>

    <view v-else-if="activeTab === 'dashboard'" class="p-4">
      <view v-if="authorStats" class="grid grid-cols-2 gap-3">
        <view class="cyber-stat-card">
          <text class="cyber-stat-value">{{ authorStats.articleCount ?? 0 }}</text>
          <text class="cyber-stat-label">文章</text>
        </view>
        <view class="cyber-stat-card">
          <text class="cyber-stat-value">{{ authorStats.totalViews ?? 0 }}</text>
          <text class="cyber-stat-label">阅读</text>
        </view>
        <view class="cyber-stat-card">
          <text class="cyber-stat-value">{{ authorStats.totalLikes ?? 0 }}</text>
          <text class="cyber-stat-label">点赞</text>
        </view>
        <view class="cyber-stat-card">
          <text class="cyber-stat-value">{{ authorStats.totalComments ?? 0 }}</text>
          <text class="cyber-stat-label">评论</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
}
</style>

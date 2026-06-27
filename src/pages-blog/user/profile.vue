<script lang="ts" setup>
/**
 * 个人中心（六 Tab 壳层，对齐 blog-home-nuxt pages/user/profile.vue）
 * - Tab 与 URL ?tab= 同步（H5 history.replaceState）
 * - 各 Tab 面板拆为 components/user/* 子组件
 */
import AvatarWithFrame from '@/components/user/avatar-with-frame.vue'
import BusinessCard from '@/components/user/business-card.vue'
import ArticleList from '@/components/user/article-list.vue'
import CollectList from '@/components/user/collect-list.vue'
import CommentReplyList from '@/components/user/comment-reply-list.vue'
import InboxList from '@/components/user/inbox-list.vue'
import DashboardPanel from '@/components/user/dashboard-panel.vue'
import { useEquippedAvatarFrame } from '@/composables/use-equipped-avatar-frame'
import { ROUTE_ARTICLE_EDIT, ROUTE_PROFILE } from '@/router/routes'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: {
    navigationBarTitleText: '个人中心',
    backgroundColor: '#050505',
    backgroundColorTop: '#050505',
    backgroundColorBottom: '#050505',
  },
})

type ProfileTab = 'card' | 'article' | 'collect' | 'comment' | 'inbox' | 'dashboard'
const TAB_VALUES: ProfileTab[] = ['card', 'article', 'collect', 'comment', 'inbox', 'dashboard']

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { frame, refresh: refreshFrame } = useEquippedAvatarFrame()

const activeTab = ref<ProfileTab>('card')

const tabs = [
  { key: 'card', label: '我的名片' },
  { key: 'article', label: '我的文章' },
  { key: 'collect', label: '我的收藏' },
  { key: 'comment', label: '我的评论/回复' },
  { key: 'inbox', label: '收到评论' },
  { key: 'dashboard', label: '数据看板' },
] as const

function resolveTab(tab: unknown): ProfileTab {
  if (typeof tab === 'string' && TAB_VALUES.includes(tab as ProfileTab))
    return tab as ProfileTab
  return 'card'
}

const avatarDisplayUrl = computed(() => resolveStaticUrl(userStore.userInfo.avatar || ''))

/** 支持从「我的」菜单带 tab 参数直达 */
onLoad((query) => {
  activeTab.value = resolveTab(query?.tab)
})

onShow(async () => {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  await userStore.fetchUserInfo().catch(() => {})
  await refreshFrame()
})

/** 切换 Tab 并写回 URL（card 为默认时不带 tab 参数） */
function switchTab(tab: ProfileTab) {
  activeTab.value = tab
  const url = tab === 'card' ? ROUTE_PROFILE : `${ROUTE_PROFILE}?tab=${tab}`
  // #ifdef H5
  if (typeof history !== 'undefined')
    history.replaceState(null, '', url)
  // #endif
}

function goWriteArticle() {
  uni.navigateTo({ url: ROUTE_ARTICLE_EDIT })
}
</script>

<template>
  <view class="profile-page cyber-page-grid">
    <view v-if="userStore.userInfo.nickname && activeTab !== 'card'" class="profile-compact-header">
      <cyber-card class="cyber-card-pad-sm">
        <view class="u-gap-3 u-flex-row-center">
          <AvatarWithFrame
            :avatar="avatarDisplayUrl"
            :alt="userStore.userInfo.nickname"
            :frame="frame"
            :size="128"
          />
          <view class="u-flex-1 min-w-0">
            <text class="block text-tech font-semibold">{{ userStore.userInfo.nickname }}</text>
            <text v-if="userStore.userInfo.intro" class="mt-1 block text-sm text-tech-muted">
              {{ userStore.userInfo.intro }}
            </text>
          </view>
        </view>
      </cyber-card>
    </view>

    <scroll-view scroll-x class="cyber-tabs">
      <view class="cyber-tabs-inner u-gap-3 flex px-2 py-2">
        <view v-for="tab in tabs" :key="tab.key" class="cyber-tabs-item">
          <text
            class="cyber-tab shrink-0"
            :class="activeTab === tab.key ? 'cyber-tab-active' : ''"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </text>
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="u-page-scroll profile-scroll">
      <view v-show="activeTab === 'card'" class="profile-tab-body">
        <BusinessCard />
      </view>

      <view v-show="activeTab === 'article'" class="profile-tab-body">
        <cyber-card class="cyber-card-pad-sm">
          <view class="profile-panel-head u-gap-3 u-flex-row-center">
            <text class="profile-panel-title">我的文章</text>
            <view class="u-flex-1" />
            <view>
              <cyber-button size="small" variant="primary" @click="goWriteArticle">
                <view class="u-flex-row-center">
                  <cyber-icon name="edit-pen" size="28rpx" />
                  <text class="profile-btn-text">写文章</text>
                </view>
              </cyber-button>
            </view>
          </view>
          <ArticleList />
        </cyber-card>
      </view>

      <view v-show="activeTab === 'collect'" class="profile-tab-body">
        <cyber-card class="cyber-card-pad-sm">
          <text class="profile-panel-title profile-panel-title--block">我的收藏</text>
          <CollectList />
        </cyber-card>
      </view>

      <view v-show="activeTab === 'comment'" class="profile-tab-body">
        <cyber-card class="cyber-card-pad-sm">
          <text class="profile-panel-title profile-panel-title--block">我的评论/回复</text>
          <CommentReplyList />
        </cyber-card>
      </view>

      <view v-show="activeTab === 'inbox'" class="profile-tab-body">
        <cyber-card class="cyber-card-pad-sm">
          <text class="cyber-section-label">INBOX</text>
          <text class="profile-panel-title profile-panel-title--block">我文章收到的评论</text>
          <InboxList />
        </cyber-card>
      </view>

      <view v-show="activeTab === 'dashboard'" class="profile-tab-body">
        <cyber-card class="cyber-card-pad-sm">
          <text class="cyber-section-label">ANALYTICS</text>
          <text class="profile-panel-title profile-panel-title--block">创作数据看板</text>
          <DashboardPanel />
        </cyber-card>
      </view>
    </scroll-view>
  </view>
</template>

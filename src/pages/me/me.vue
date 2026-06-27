<script lang="ts" setup>
/**
 * 我的 Tab：用户卡片 + 个人中心功能菜单（分组 cell 列表）
 * - 单卡片内多行 cell，行间距由 margin-bottom 控制
 * - 未登录可见全部菜单，点击跳转登录并带 redirect
 * - 功能项由原个人中心六 Tab 拆出，详情仍在 profile 子页
 */
import { getUnreadCount } from '@/api/notification'
import { meMenuSections, resolveMeMenuRoute } from '@/config/me-menu'
import type { MeMenuItem } from '@/config/me-menu'
import { storeToRefs } from 'pinia'
import { LOGIN_PAGE, ROUTE_PROFILE } from '@/router/config'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: { navigationBarTitleText: '我的' },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)
const unreadCount = ref(0)

onShow(async () => {
  if (!tokenStore.hasLogin) {
    unreadCount.value = 0
    return
  }
  await userStore.fetchUserInfo().catch(() => {})
  try {
    unreadCount.value = (await getUnreadCount())?.count ?? 0
  }
  catch {
    unreadCount.value = 0
  }
})

function menuBadge(item: MeMenuItem) {
  if (item.tab === 'inbox' && unreadCount.value > 0)
    return unreadCount.value > 99 ? '99+' : String(unreadCount.value)
  return ''
}

function handleMenuClick(item: MeMenuItem) {
  const target = resolveMeMenuRoute(item)
  if (item.requiresLogin && !tokenStore.hasLogin) {
    uni.navigateTo({
      url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(target)}`,
    })
    return
  }
  uni.navigateTo({ url: target })
}

function goUserCard() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: LOGIN_PAGE })
    return
  }
  uni.navigateTo({ url: `${ROUTE_PROFILE}?tab=card` })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm)
        tokenStore.logout()
    },
  })
}
</script>

<template>
  <scroll-view scroll-y class="me-page cyber-page-grid u-page-scroll">
    <view class="u-page-body me-page-body">
      <!-- 用户卡片 -->
      <view class="me-section">
        <cyber-card class="cyber-card-pad-menu--solo">
          <view class="cyber-card-row me-user-card-row" @tap="goUserCard">
            <template v-if="tokenStore.hasLogin">
              <view class="me-user-card-main u-flex-row-center u-gap-3 min-w-0 flex-1">
                <image :src="userInfo.avatar" class="me-user-avatar shrink-0 border border-tech rounded-full" mode="aspectFill" />
                <view class="u-flex-1 min-w-0">
                  <text class="block text-lg text-tech font-bold">{{ userInfo.nickname }}</text>
                  <text class="text-sm text-tech-muted">@{{ userInfo.username }}</text>
                </view>
              </view>
              <view class="me-user-card-trail">
                <view class="cyber-cell-trail-icon">
                  <cyber-chevron />
                </view>
              </view>
            </template>
            <template v-else>
              <view class="me-user-card-main u-flex-row-center u-gap-3 min-w-0 flex-1">
                <view class="me-guest-avatar">
                  <cyber-icon name="user" size="84rpx" />
                </view>
                <view class="u-flex-1 min-w-0">
                  <text class="block text-tech font-semibold">登录 / 注册</text>
                  <text class="mt-1 block text-xs text-tech-muted">登录后管理资料、文章与互动数据</text>
                </view>
              </view>
              <view class="me-user-card-trail">
                <view class="cyber-cell-trail-icon">
                  <cyber-chevron />
                </view>
              </view>
            </template>
          </view>
        </cyber-card>
      </view>

      <!-- 功能菜单：分组单卡片，cell 下边距拉开行距 -->
      <view
        v-for="section in meMenuSections"
        :key="section.title"
        class="me-section"
      >
        <text class="me-section-title">{{ section.title }}</text>
        <cyber-card
          class="cyber-card-pad-menu"
          :class="section.items.length === 1 ? 'cyber-card-pad-menu--compact' : 'cyber-card-pad-menu--group'"
        >
          <view
            class="cyber-menu-list"
            :class="section.items.length > 1 ? 'cyber-menu-list--multi' : ''"
          >
            <view
              v-for="item in section.items"
              :key="item.title"
              class="cyber-menu-list-row"
            >
              <cyber-cell
                :icon="item.icon"
                :title="item.title"
                :desc="item.desc"
                :badge="menuBadge(item)"
                @click="handleMenuClick(item)"
              />
            </view>
          </view>
        </cyber-card>
      </view>

      <!-- 退出登录 -->
      <view v-if="tokenStore.hasLogin" class="me-section me-section--tail">
        <cyber-card class="cyber-card-pad-menu cyber-card-pad-menu--compact">
          <view class="cyber-menu-list">
            <view class="cyber-menu-list-row">
              <cyber-cell
                icon="logout"
                title="退出登录"
                desc="退出当前账号"
                @click="handleLogout"
              />
            </view>
          </view>
        </cyber-card>
      </view>
    </view>
  </scroll-view>
</template>

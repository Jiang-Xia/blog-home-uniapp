<script lang="ts" setup>
/**
 * 我的 Tab：用户卡片 + 个人中心功能菜单（cell 列表）
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
  try {
    unreadCount.value = (await getUnreadCount())?.count ?? 0
  }
  catch {
    unreadCount.value = 0
  }
})

function menuValue(item: MeMenuItem) {
  if (tokenStore.hasLogin)
    return ''
  return item.requiresLogin ? '登录后可用' : ''
}

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
    void handleLogin()
    return
  }
  uni.navigateTo({ url: `${ROUTE_PROFILE}?tab=card` })
}

async function handleLogin() {
  // #ifdef MP-WEIXIN
  try {
    await tokenStore.wxLogin()
  }
  catch {
    uni.navigateTo({ url: LOGIN_PAGE })
  }
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({ url: LOGIN_PAGE })
  // #endif
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
    <view class="u-page-body u-stack-3 py-4">
      <!-- 用户卡片 -->
      <cyber-card class="cyber-card-pad-menu" @click="goUserCard">
        <view v-if="tokenStore.hasLogin" class="cyber-card-row u-gap-3">
          <image :src="userInfo.avatar" class="h-14 w-14 shrink-0 border border-tech rounded-full" mode="aspectFill" />
          <view class="u-flex-1 min-w-0">
            <text class="block text-lg text-tech font-bold">{{ userInfo.nickname }}</text>
            <text class="text-sm text-tech-muted">@{{ userInfo.username }}</text>
          </view>
          <text class="cyber-menu-chevron">›</text>
        </view>
        <view v-else class="cyber-card-row u-gap-3">
          <view class="me-guest-avatar">
            👤
          </view>
          <view class="u-flex-1 min-w-0">
            <text class="block text-tech font-semibold">登录 / 注册</text>
            <text class="mt-1 block text-xs text-tech-muted">登录后管理资料、文章与互动数据</text>
          </view>
          <text class="cyber-menu-chevron">›</text>
        </view>
      </cyber-card>

      <!-- 功能菜单 -->
      <view
        v-for="section in meMenuSections"
        :key="section.title"
        class="me-section"
      >
        <text class="me-section-title">{{ section.title }}</text>
        <cyber-card class="cyber-card-pad-menu">
          <view class="cyber-menu-list">
            <cyber-cell
              v-for="item in section.items"
              :key="item.title"
              :icon="item.icon"
              :title="item.title"
              :desc="item.desc"
              :value="menuValue(item)"
              :badge="menuBadge(item)"
              @click="handleMenuClick(item)"
            />
          </view>
        </cyber-card>
      </view>

      <!-- 退出登录 -->
      <view v-if="tokenStore.hasLogin" class="me-section">
        <cyber-card class="cyber-card-pad-menu">
          <view class="cyber-menu-list">
            <cyber-cell
              icon="🚪"
              title="退出登录"
              desc="退出当前账号"
              @click="handleLogout"
            />
          </view>
        </cyber-card>
      </view>
    </view>
  </scroll-view>
</template>

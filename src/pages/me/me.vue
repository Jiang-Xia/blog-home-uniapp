<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { getUnreadCount } from '@/api/notification'
import { LOGIN_PAGE, ROUTE_ABOUT, ROUTE_LINKS, ROUTE_MSGBOARD, ROUTE_PROFILE, ROUTE_TOOL_INDEX } from '@/router/config'
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
  if (tokenStore.hasLogin) {
    try {
      unreadCount.value = (await getUnreadCount())?.count ?? 0
    }
    catch {
      unreadCount.value = 0
    }
  }
})

const menuItems = computed(() => [
  { label: '个人中心', route: ROUTE_PROFILE, badge: unreadCount.value },
  { label: '留言板', route: ROUTE_MSGBOARD, badge: 0 },
  { label: '友情链接', route: ROUTE_LINKS, badge: 0 },
  { label: '工具箱', route: ROUTE_TOOL_INDEX, badge: 0 },
  { label: '关于作者', route: ROUTE_ABOUT, badge: 0 },
])

function navigateToRoute(route: string) {
  uni.navigateTo({ url: route })
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
      if (res.confirm) {
        tokenStore.logout()
        unreadCount.value = 0
      }
    },
  })
}
</script>

<template>
  <scroll-view scroll-y class="me-page cyber-page-grid">
    <view class="px-4 py-6">
      <cyber-card class="!p-5">
        <view v-if="tokenStore.hasLogin" class="flex items-center gap-3">
          <image :src="userInfo.avatar" class="h-14 w-14 border border-tech rounded-full" />
          <view>
            <text class="block text-lg text-tech font-bold">{{ userInfo.nickname }}</text>
            <text class="text-sm text-tech-muted">@{{ userInfo.username }}</text>
          </view>
        </view>
        <view v-else class="py-2 text-center">
          <text class="block text-tech-muted">登录后查看个人数据</text>
          <cyber-button class="mt-4 inline-flex" variant="primary" @click="handleLogin">
            立即登录
          </cyber-button>
        </view>
      </cyber-card>
    </view>

    <view class="px-3 pb-4">
      <view
        v-for="item in menuItems"
        :key="item.route"
        class="mb-3"
        @click="navigateToRoute(item.route)"
      >
        <cyber-card class="flex items-center justify-between !px-4 !py-3">
          <view class="flex items-center gap-2">
            <text class="text-tech">{{ item.label }}</text>
            <view v-if="item.badge > 0" class="rounded-full bg-red-500/90 px-2 text-xs text-white">
              {{ item.badge > 99 ? '99+' : item.badge }}
            </view>
          </view>
          <text class="text-tech-faint">›</text>
        </cyber-card>
      </view>
    </view>

    <view class="px-3 pb-8">
      <cyber-button
        v-if="tokenStore.hasLogin"
        block
        variant="secondary"
        @click="handleLogout"
      >
        退出登录
      </cyber-button>
      <cyber-button
        v-else
        block
        variant="primary"
        @click="handleLogin"
      >
        登录
      </cyber-button>
    </view>
  </scroll-view>
</template>

<style scoped>
.me-page {
  height: 100vh;
}
</style>

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
  <view class="me-page">
    <view class="bg-white px-4 py-6">
      <view v-if="tokenStore.hasLogin" class="flex items-center gap-3">
        <image :src="userInfo.avatar" class="h-14 w-14 rounded-full" />
        <view>
          <text class="block text-lg font-bold">{{ userInfo.nickname }}</text>
          <text class="text-sm text-gray-500">@{{ userInfo.username }}</text>
        </view>
      </view>
      <view v-else class="text-center text-gray-500">
        登录后查看个人数据
      </view>
    </view>

    <view class="mt-3 px-3">
      <view
        v-for="item in menuItems"
        :key="item.route"
        class="mb-2 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
        @click="navigateToRoute(item.route)"
      >
        <view class="flex items-center gap-2">
          <text>{{ item.label }}</text>
          <view v-if="item.badge > 0" class="rounded-full bg-red-500 px-2 text-xs text-white">
            {{ item.badge > 99 ? '99+' : item.badge }}
          </view>
        </view>
        <text class="text-gray-400">›</text>
      </view>
    </view>

    <view class="mt-8 px-3">
      <wd-button v-if="tokenStore.hasLogin" block type="warning" @click="handleLogout">
        退出登录
      </wd-button>
      <wd-button v-else block @click="handleLogin">
        登录
      </wd-button>
    </view>
  </view>
</template>

<style scoped>
.me-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

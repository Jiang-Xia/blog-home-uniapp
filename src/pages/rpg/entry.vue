<script lang="ts" setup>
import { getRpgSignInfo, getRpgStatus } from '@/api/rpg'
import { ROUTE_RPG_FULL } from '@/router/routes'
import { useTokenStore } from '@/store/token'
import type { RpgStatus, SignInfo } from '@/types/rpg'

definePage({
  style: { navigationBarTitleText: '冒险' },
})

const tokenStore = useTokenStore()
const status = ref<RpgStatus | null>(null)
const signInfo = ref<SignInfo | null>(null)
const loading = ref(false)

async function loadStatus() {
  if (!tokenStore.hasLogin)
    return
  loading.value = true
  try {
    status.value = await getRpgStatus()
    signInfo.value = await getRpgSignInfo()
  }
  finally {
    loading.value = false
  }
}

onShow(() => {
  void loadStatus()
})

function goRpg() {
  if (!tokenStore.hasLogin) {
    // #ifdef MP-WEIXIN
    void tokenStore.wxLogin().catch(() => uni.navigateTo({ url: '/pages/auth/login' }))
    // #endif
    // #ifndef MP-WEIXIN
    uni.navigateTo({ url: '/pages/auth/login' })
    // #endif
    return
  }
  uni.navigateTo({ url: ROUTE_RPG_FULL })
}
</script>

<template>
  <view class="entry-page px-4 py-6">
    <view v-if="!tokenStore.hasLogin" class="text-center">
      <text class="block text-gray-600">登录后即可进入冒险中心</text>
      <wd-button class="mt-4" @click="goRpg">
        去登录
      </wd-button>
    </view>
    <template v-else>
      <view v-if="loading" class="py-8 text-center text-gray-400">
        加载状态...
      </view>
      <view v-else-if="status" class="mb-6 rounded-xl from-indigo-500 to-purple-700 bg-gradient-to-br p-5 text-white">
        <text class="block text-xl font-bold">Lv.{{ status.level }} 冒险者</text>
        <text class="mt-2 block text-sm">经验 {{ status.exp }} · 生命 {{ status.lifeValue }}</text>
        <text class="mt-1 block text-sm">💎 {{ status.currency ?? 0 }}</text>
        <text class="mt-2 block text-xs opacity-80">
          {{ signInfo?.signedToday ? '今日已签到 ✓' : '今日尚未签到' }} · 连续 {{ status.consecutiveSignDays }} 天
        </text>
      </view>
      <wd-button block @click="goRpg">
        进入冒险中心
      </wd-button>
    </template>
  </view>
</template>

<style scoped>
.entry-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

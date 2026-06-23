<script lang="ts" setup>
import { getRpgSignInfo, getRpgStatus } from '@/api/rpg'
import { ROUTE_RPG_FULL, ROUTE_RPG_GUIDE } from '@/router/routes'
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

function goGuide() {
  uni.navigateTo({ url: ROUTE_RPG_GUIDE })
}
</script>

<template>
  <scroll-view scroll-y class="entry-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-6">
      <cyber-section-header
        label="RPG"
        title="冒险中心"
        subtitle="签到升级 · 任务奖励 · 抽奖开宝箱"
      />

      <view v-if="!tokenStore.hasLogin" class="mt-6 text-center">
        <cyber-card class="!p-6">
          <text class="block text-tech-muted">登录后即可进入冒险中心</text>
          <cyber-button class="mt-4 inline-flex" variant="primary" @click="goRpg">
            去登录
          </cyber-button>
        </cyber-card>
      </view>

      <template v-else>
        <view v-if="loading" class="py-8 text-center text-tech-subtle">
          加载状态...
        </view>
        <template v-else>
          <cyber-card v-if="status" class="mb-4 !p-5">
            <text class="cyber-gradient-text-amber block text-xl font-bold">Lv.{{ status.level }} 冒险者</text>
            <text class="mt-2 block text-sm text-tech-muted">经验 {{ status.exp }} · 生命 {{ status.lifeValue }}</text>
            <text class="mt-1 block text-sm text-tech-primary">💎 {{ status.currency ?? 0 }}</text>
            <text class="mt-3 block text-xs text-tech-subtle">
              {{ signInfo?.signedToday ? '今日已签到 ✓' : '今日尚未签到' }} · 连续 {{ status.consecutiveSignDays }} 天
            </text>
          </cyber-card>

          <view class="u-form-actions">
            <view class="u-form-action-item">
              <cyber-button block variant="primary" @click="goRpg">
                ⚔️ 进入冒险中心
              </cyber-button>
            </view>
            <view class="u-form-action-item">
              <cyber-button block variant="secondary" @click="goGuide">
                冒险攻略
              </cyber-button>
            </view>
          </view>
        </template>
      </template>
    </view>
  </scroll-view>
</template>

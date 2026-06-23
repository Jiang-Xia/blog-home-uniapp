<script lang="ts" setup>
/**
 * 发现 Tab：分区玻璃卡片 + 四列功能格
 * - 个人中心已迁至「我的」Tab；此处为站点浏览、社区与工具入口
 */
import { exploreSections } from '@/config/quick-entries'
import type { ExploreItem } from '@/config/quick-entries'
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

definePage({
  excludeLoginPath: true,
  style: {
    navigationBarTitleText: '发现',
  },
})

const tokenStore = useTokenStore()

function handleEntry(item: ExploreItem) {
  if (item.phase !== 1) {
    uni.showToast({ title: '即将上线', icon: 'none' })
    return
  }
  if (item.requiresLogin && !tokenStore.hasLogin) {
    uni.navigateTo({
      url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(item.route)}`,
    })
    return
  }
  uni.navigateTo({ url: item.route })
}
</script>

<template>
  <scroll-view scroll-y class="explore-page cyber-page-grid u-page-scroll">
    <cyber-page-container :grid="false" label="EXPLORE" title="快速入口" subtitle="按场景浏览站点功能，一键直达">
      <view class="u-stack-3">
        <view
          v-for="section in exploreSections"
          :key="section.title"
          class="cyber-explore-section cyber-glass-card cyber-card-pad-sm"
        >
          <view class="cyber-explore-section-header">
            <view
              class="cyber-explore-section-icon flex shrink-0 items-center justify-center bg-gradient-to-br text-lg"
              :class="section.color"
            >
              {{ section.icon }}
            </view>
            <view class="u-flex-1 min-w-0">
              <view class="u-gap-2 flex items-center">
                <text class="text-base text-tech font-semibold">{{ section.title }}</text>
                <text class="cyber-explore-section-count">{{ section.items.length }}</text>
              </view>
              <text class="mt-1 block text-xs text-tech-muted">{{ section.subtitle }}</text>
            </view>
          </view>

          <view class="u-grid-4">
            <view
              v-for="item in section.items"
              :key="item.route"
              class="u-grid-4-item"
              @click="handleEntry(item)"
            >
              <view class="cyber-explore-tile">
                <view
                  class="cyber-explore-tile-icon flex items-center justify-center bg-gradient-to-br"
                  :class="item.color"
                >
                  <text class="text-lg">{{ item.icon }}</text>
                </view>
                <text class="cyber-explore-tile-title">{{ item.title }}</text>
                <text class="cyber-explore-tile-desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="u-stack-3 mt-2">
        <cyber-alert variant="warning">
          <text class="text-sm text-tech-muted">
            <text class="text-tech font-semibold">新用户提示：</text>
            注册登录后可以发表文章、评论互动，在「我的」页管理你的内容。
          </text>
        </cyber-alert>
        <cyber-alert variant="info">
          <text class="text-sm text-tech-muted">
            <text class="text-tech font-semibold">冒险玩法：</text>
            登录后进入「冒险」页签到、做任务、抽奖开宝箱，阅读评论也能推进任务进度。
          </text>
        </cyber-alert>
      </view>
    </cyber-page-container>
  </scroll-view>
</template>

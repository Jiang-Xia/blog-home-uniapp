<script lang="ts" setup>
import { quickEntries } from '@/config/quick-entries'
import type { QuickEntry } from '@/config/quick-entries'

definePage({
  excludeLoginPath: true,
  style: {
    navigationBarTitleText: '发现',
  },
})

function handleEntry(item: QuickEntry) {
  if (item.phase !== 1) {
    uni.showToast({ title: '即将上线', icon: 'none' })
    return
  }
  uni.navigateTo({ url: item.route })
}
</script>

<template>
  <scroll-view scroll-y class="explore-page cyber-page-grid">
    <cyber-page-container :grid="false" label="EXPLORE" title="快速入口" subtitle="选择你感兴趣的方向，一键直达">
      <view class="flex flex-col gap-3">
        <view
          v-for="item in quickEntries"
          :key="item.route"
          @click="handleEntry(item)"
        >
          <cyber-card class="flex flex-col !p-4">
            <view
              class="mb-3 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br text-lg"
              :class="item.color"
            >
              {{ item.icon }}
            </view>
            <view class="mb-2 flex items-center gap-2">
              <text class="text-lg text-tech font-semibold">{{ item.title }}</text>
              <text
                v-if="item.phase !== 1"
                class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-tech-subtle"
              >
                即将上线
              </text>
            </view>
            <text class="mb-3 block flex-1 text-sm text-tech-muted leading-relaxed">{{ item.desc }}</text>
            <view class="flex flex-wrap gap-1.5">
              <text v-for="tag in item.tags" :key="tag" class="cyber-feature-tag">{{ tag }}</text>
            </view>
          </cyber-card>
        </view>
      </view>

      <view class="mt-6 space-y-3">
        <cyber-alert variant="warning">
          <text class="text-sm text-tech-muted">
            <text class="text-tech font-semibold">新用户提示：</text>
            注册登录后可以发表文章、评论互动，在个人中心管理你的内容。
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

<style scoped>
.explore-page {
  height: 100vh;
}
</style>

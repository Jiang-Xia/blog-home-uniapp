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
  <view class="explore px-4 py-4">
    <view class="mb-4 text-base text-gray-800 font-medium">
      快速入口
    </view>
    <view class="text-sm text-gray-500">
      选择你感兴趣的方向，一键直达
    </view>
    <view class="mt-4 flex flex-col gap-3">
      <view
        v-for="item in quickEntries"
        :key="item.route"
        class="rounded-lg bg-white p-4 shadow-sm"
        @click="handleEntry(item)"
      >
        <view class="flex items-start gap-3">
          <text class="text-2xl">{{ item.icon }}</text>
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-2">
              <text class="text-gray-800 font-medium">{{ item.title }}</text>
              <text
                v-if="item.phase !== 1"
                class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                即将上线
              </text>
            </view>
            <view class="mt-1 text-sm text-gray-500">
              {{ item.desc }}
            </view>
            <view class="mt-2 flex flex-wrap gap-1">
              <text
                v-for="tag in item.tags"
                :key="tag"
                class="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
              >
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

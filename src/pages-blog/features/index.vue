<script lang="ts" setup>
/**
 * 博客系统特性页（对齐 blog-home-nuxt /features）
 * - 静态模块卡片，跳转 uniapp 对应页面
 */
import {
  coreFeatureModules,
  experienceFeatureModules,
  getStartedSteps,
  rpgFeatureModule,
  toolFeatureLinks,
} from '@/config/feature-modules'
import { ROUTE_RPG_GUIDE, ROUTE_TOOL_INDEX } from '@/router/routes'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '系统特性' },
})

function goRoute(route: string) {
  const tabPages = ['/pages/index/index', '/pages/explore/explore', '/pages/rpg/entry', '/pages/me/me']
  if (tabPages.includes(route.split('?')[0])) {
    uni.switchTab({ url: route.split('?')[0] })
    return
  }
  uni.navigateTo({ url: route })
}
</script>

<template>
  <scroll-view scroll-y class="features-page">
    <view class="px-4 py-4">
      <text class="block text-lg font-bold">博客系统特性</text>
      <text class="mt-1 block text-sm text-gray-500">内容创作、RPG 游戏化、实用工具与交互体验</text>

      <view class="mt-6 rounded-xl from-amber-50 to-orange-50 bg-gradient-to-br p-4">
        <view class="flex items-start gap-3">
          <text class="text-3xl">{{ rpgFeatureModule.icon }}</text>
          <view class="flex-1">
            <text class="block text-xs text-amber-700">核心玩法</text>
            <text class="mt-1 block text-lg font-bold">{{ rpgFeatureModule.title }}</text>
            <text class="mt-2 block text-sm text-gray-600">{{ rpgFeatureModule.desc }}</text>
            <view class="mt-2 flex flex-wrap gap-1">
              <text v-for="tag in rpgFeatureModule.tags" :key="tag" class="rounded bg-white/80 px-2 py-0.5 text-xs">{{ tag }}</text>
            </view>
            <view class="mt-3 flex flex-wrap gap-2">
              <wd-button size="small" @click="goRoute(rpgFeatureModule.route)">
                进入冒险中心
              </wd-button>
              <wd-button size="small" type="info" @click="goRoute(ROUTE_RPG_GUIDE)">
                玩法说明
              </wd-button>
            </view>
          </view>
        </view>
      </view>

      <text class="mb-3 mt-8 block font-medium">博客核心</text>
      <view
        v-for="item in coreFeatureModules"
        :key="item.title"
        class="mb-3 rounded-lg bg-white p-4 shadow-sm"
        @click="goRoute(item.route)"
      >
        <view class="flex items-start gap-3">
          <text class="text-2xl">{{ item.icon }}</text>
          <view class="min-w-0 flex-1">
            <text class="block font-medium">{{ item.title }}</text>
            <text class="mt-1 block text-sm text-gray-500">{{ item.desc }}</text>
            <view class="mt-2 flex flex-wrap gap-1">
              <text v-for="tag in item.tags" :key="tag" class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>

      <text class="mb-3 mt-6 block font-medium">交互体验</text>
      <view
        v-for="item in experienceFeatureModules"
        :key="item.title"
        class="mb-3 rounded-lg bg-white p-4 shadow-sm"
        @click="goRoute(item.route)"
      >
        <view class="flex items-start gap-3">
          <text class="text-2xl">{{ item.icon }}</text>
          <view class="min-w-0 flex-1">
            <text class="block font-medium">{{ item.title }}</text>
            <text class="mt-1 block text-sm text-gray-500">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <text class="mb-3 mt-6 block font-medium">实用工具箱 · {{ toolFeatureLinks.length }} 款</text>
      <view class="flex flex-wrap gap-2">
        <text
          v-for="tool in toolFeatureLinks"
          :key="tool.route"
          class="border border-gray-200 rounded-full bg-white px-3 py-1 text-xs text-gray-700"
          @click="goRoute(tool.route)"
        >
          {{ tool.title }}
        </text>
      </view>
      <wd-button block class="mt-4" type="info" @click="goRoute(ROUTE_TOOL_INDEX)">
        进入工具箱
      </wd-button>

      <text class="mb-3 mt-8 block font-medium">三步开始</text>
      <view
        v-for="(step, i) in getStartedSteps"
        :key="step.title"
        class="mb-3 rounded-lg bg-white p-4 text-center shadow-sm"
      >
        <text class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-sm text-blue-600 font-bold">{{ i + 1 }}</text>
        <text class="mt-2 block font-medium">{{ step.title }}</text>
        <text class="mt-1 block text-sm text-gray-500">{{ step.desc }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.features-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

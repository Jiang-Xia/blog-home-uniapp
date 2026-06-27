<script lang="ts" setup>
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
  <scroll-view scroll-y class="features-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-4">
      <cyber-section-header
        label="FEATURES"
        title="博客系统特性"
        subtitle="内容创作、RPG 游戏化、实用工具与交互体验"
        align="left"
      />

      <cyber-card class="mt-6 !p-4">
        <view class="u-gap-3 flex items-start">
          <cyber-icon :name="rpgFeatureModule.icon" size="56rpx" class="shrink-0" />
          <view class="flex-1">
            <text class="block text-xs text-tech-primary">核心玩法</text>
            <text class="mt-1 block text-lg text-tech font-bold">{{ rpgFeatureModule.title }}</text>
            <text class="mt-2 block text-sm text-tech-muted">{{ rpgFeatureModule.desc }}</text>
            <view class="u-gap-1 mt-2 flex flex-wrap">
              <text v-for="tag in rpgFeatureModule.tags" :key="tag" class="cyber-feature-tag">{{ tag }}</text>
            </view>
            <view class="u-gap-2 mt-3 flex flex-wrap">
              <cyber-button size="small" variant="primary" @click="goRoute(rpgFeatureModule.route)">
                进入冒险中心
              </cyber-button>
              <cyber-button size="small" variant="secondary" @click="goRoute(ROUTE_RPG_GUIDE)">
                玩法说明
              </cyber-button>
            </view>
          </view>
        </view>
      </cyber-card>

      <text class="mb-3 mt-8 block text-tech font-medium">博客核心</text>
      <view
        v-for="item in coreFeatureModules"
        :key="item.title"
        class="mb-3"
        @click="goRoute(item.route)"
      >
        <cyber-card class="!p-4">
          <view class="u-gap-3 flex items-start">
            <cyber-icon :name="item.icon" size="48rpx" class="shrink-0" />
            <view class="min-w-0 flex-1">
              <text class="block text-tech font-medium">{{ item.title }}</text>
              <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
              <view class="u-gap-1 mt-2 flex flex-wrap">
                <text v-for="tag in item.tags" :key="tag" class="cyber-feature-tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </cyber-card>
      </view>

      <text class="mb-3 mt-6 block text-tech font-medium">交互体验</text>
      <view
        v-for="item in experienceFeatureModules"
        :key="item.title"
        class="mb-3"
        @click="goRoute(item.route)"
      >
        <cyber-card class="!p-4">
          <view class="u-gap-3 flex items-start">
            <cyber-icon :name="item.icon" size="48rpx" class="shrink-0" />
            <view class="min-w-0 flex-1">
              <text class="block text-tech font-medium">{{ item.title }}</text>
              <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
            </view>
          </view>
        </cyber-card>
      </view>

      <text class="mb-3 mt-6 block text-tech font-medium">实用工具箱 · {{ toolFeatureLinks.length }} 款</text>
      <view class="u-gap-2 flex flex-wrap">
        <text
          v-for="tool in toolFeatureLinks"
          :key="tool.route"
          class="cyber-feature-tag"
          @click="goRoute(tool.route)"
        >
          {{ tool.title }}
        </text>
      </view>
      <cyber-button block class="mt-4" variant="secondary" @click="goRoute(ROUTE_TOOL_INDEX)">
        进入工具箱
      </cyber-button>

      <text class="mb-3 mt-8 block text-tech font-medium">三步开始</text>
      <cyber-card
        v-for="(step, i) in getStartedSteps"
        :key="step.title"
        class="mb-3 text-center !p-4"
      >
        <text class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-sm text-tech-primary font-bold">{{ i + 1 }}</text>
        <text class="mt-2 block text-tech font-medium">{{ step.title }}</text>
        <text class="mt-1 block text-sm text-tech-muted">{{ step.desc }}</text>
      </cyber-card>
    </view>
  </scroll-view>
</template>

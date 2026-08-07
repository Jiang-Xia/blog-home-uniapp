<script setup lang="ts">
/**
 * 赛博风列表 Cell：左图标+标题，右辅助文案+箭头
 * - 彩色图标用 cyber-icon（SVG）；箭头用 cyber-chevron（wot-ui）
 * - 多行时须外包 cyber-menu-list-row（MP 选择器兼容）
 */
import type { AppIconName } from '@/config/app-icons'

defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  icon?: AppIconName
  title: string
  desc?: string
  /** 右侧辅助文案（如「登录后可用」） */
  value?: string
  badge?: string
  /** 独立卡片内单行，无分组底边线 */
  solo?: boolean
}>(), {
  solo: false,
})

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <view
    class="cyber-menu-item"
    :class="solo ? 'cyber-menu-item--solo' : ''"
    @tap="emit('click')"
  >
    <view class="cyber-cell-main">
      <view v-if="icon" class="cyber-cell-icon">
        <cyber-icon :name="icon" size="60rpx" />
      </view>
      <view class="cyber-cell-text">
        <text class="cyber-cell-title">{{ title }}</text>
        <text v-if="desc" class="cyber-cell-desc">{{ desc }}</text>
      </view>
    </view>
    <view class="cyber-cell-trail">
      <view v-if="badge" class="cyber-cell-badge">
        {{ badge }}
      </view>
      <text v-if="value" class="cyber-cell-value">{{ value }}</text>
      <view class="cyber-cell-trail-icon">
        <cyber-chevron />
      </view>
    </view>
  </view>
</template>

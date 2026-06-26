<script setup lang="ts">
/**
 * 赛博风列表 Cell：左图标+标题，右辅助文案+箭头
 * - 配合 cyber-menu-list / cyber-card-pad-menu 使用
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  icon?: string
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
        <text>{{ icon }}</text>
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
      <text class="cyber-menu-chevron">›</text>
    </view>
  </view>
</template>

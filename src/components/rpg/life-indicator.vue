<script lang="ts" setup>
/**
 * 小型生命值指示器 — 绿色正常 / 黄色警告 / 红色危险
 */
const props = defineProps<{
  lifeValue: number
}>()

function getLifeColor(life: number): string {
  if (life > 60)
    return '#4ade80'
  if (life > 30)
    return '#fbbf24'
  return '#ef4444'
}

const lifeColor = computed(() => getLifeColor(props.lifeValue))

const lifePercent = computed(() => Math.max(0, Math.min(100, props.lifeValue)))

const statusText = computed(() => {
  if (props.lifeValue > 60)
    return '状态良好'
  if (props.lifeValue > 30)
    return '注意危险'
  if (props.lifeValue > 0)
    return '即将归零！'
  return '已归零'
})
</script>

<template>
  <view class="life-indicator">
    <view class="life-indicator__bar-bg">
      <view
        class="life-indicator__bar-fill"
        :style="{ width: `${lifePercent}%`, backgroundColor: lifeColor }"
      />
    </view>
    <text class="life-indicator__text" :style="{ color: lifeColor }">
      ❤ {{ lifeValue }}/100
      <text class="life-indicator__status">{{ statusText }}</text>
    </text>
  </view>
</template>

<style scoped lang="scss">
.life-indicator {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.04);
  font-size: 24rpx;
}

.life-indicator__bar-bg {
  width: 120rpx;
  height: 12rpx;
  margin-right: 16rpx;
  border-radius: 6rpx;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex-shrink: 0;
}

.life-indicator__bar-fill {
  height: 100%;
  border-radius: 6rpx;
}

.life-indicator__text {
  font-weight: 600;
  white-space: nowrap;
}

.life-indicator__status {
  font-weight: 400;
  opacity: 0.7;
  margin-left: 8rpx;
}
</style>

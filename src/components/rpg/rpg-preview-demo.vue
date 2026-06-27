<script lang="ts" setup>
/**
 * 未登录访客 RPG 试玩预览（对齐 Nuxt RpgPreviewDemo）
 */
const demoLevel = ref(1)
const demoExp = ref(35)
const demoQuestDone = ref(1)
const demoQuestTotal = 4
const demoPhase = ref(0)

const phases = [
  { icon: '📅', text: '每日签到 +10 EXP' },
  { icon: '💬', text: '评论文章推进任务' },
  { icon: '🎁', text: '领取奖励升级' },
  { icon: '🎰', text: '抽奖开宝箱' },
]

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    demoPhase.value = (demoPhase.value + 1) % phases.length
    demoExp.value = Math.min(100, demoExp.value + 18)
    if (demoExp.value >= 100) {
      demoExp.value = 20
      demoLevel.value = Math.min(15, demoLevel.value + 1)
    }
    if (demoPhase.value === 2 && demoQuestDone.value < demoQuestTotal)
      demoQuestDone.value += 1
    if (demoQuestDone.value >= demoQuestTotal && demoPhase.value === 0)
      demoQuestDone.value = 1
  }, 2200)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <cyber-card class="preview-demo !p-4">
    <view class="mb-3 flex items-center justify-between">
      <text class="text-xs text-tech-primary font-medium">试玩预览</text>
      <text class="text-tech-faint text-xs">登录后数据实时同步</text>
    </view>
    <view class="u-gap-3 mb-3 flex items-center">
      <text class="preview-avatar">🧙</text>
      <view class="flex-1">
        <view class="u-gap-2 flex items-center">
          <text class="text-sm text-tech font-medium">冒险者·路人</text>
          <text class="level-badge">Lv.{{ demoLevel }}</text>
        </view>
        <view class="u-bg-white-20 mt-2 h-1.5 overflow-hidden rounded-full">
          <view class="h-full rounded-full bg-amber-300" :style="{ width: `${demoExp}%` }" />
        </view>
        <text class="mt-1 block text-xs text-tech-subtle">任务 {{ demoQuestDone }}/{{ demoQuestTotal }}</text>
      </view>
    </view>
    <view class="phase-row">
      <text class="phase-icon">{{ phases[demoPhase]?.icon }}</text>
      <text class="phase-text">{{ phases[demoPhase]?.text }}</text>
    </view>
  </cyber-card>
</template>

<style scoped>
.preview-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  text-align: center;
  line-height: 48px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
}
.level-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.25);
  color: #c4b5fd;
}
.phase-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}
.phase-icon {
  font-size: 18px;
  margin-right: 8px;
}
.phase-text {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.75);
}
</style>

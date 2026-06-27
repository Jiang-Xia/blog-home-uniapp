<script lang="ts" setup>
/**
 * 任务完成轻量徽章（questComplete WS）
 * - 底部浮层，自动消失
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  visible: boolean
  questName: string
  expReward?: number
  hpReward?: number
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

let dismissTimer: ReturnType<typeof setTimeout> | null = null

const rewardHint = computed(() => {
  const parts: string[] = []
  if (props.expReward)
    parts.push(`+${props.expReward} EXP`)
  if (props.hpReward)
    parts.push(`+${props.hpReward} HP`)
  return parts.join(' · ')
})

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function dismiss() {
  clearDismissTimer()
  emit('close')
}

watch(
  () => props.visible,
  (v) => {
    clearDismissTimer()
    if (!v)
      return
    playSfx('uiClick')
    dismissTimer = setTimeout(dismiss, 3600)
  },
)

onUnmounted(clearDismissTimer)
</script>

<template>
  <view
    v-if="visible"
    class="quest-complete-badge"
    @click="dismiss"
  >
    <cyber-card class="badge-card cyber-card-pad-sm u-flex-row-center">
      <text class="badge-icon">🎯</text>
      <view class="badge-body">
        <text class="badge-kicker">任务已完成</text>
        <text class="badge-title">{{ questName || '任务' }}</text>
        <text v-if="rewardHint" class="badge-sub">待领取 {{ rewardHint }}</text>
        <text v-else class="badge-sub">去冒险页领取奖励吧</text>
      </view>
      <text class="badge-chevron">→</text>
    </cyber-card>
  </view>
</template>

<style scoped>
.quest-complete-badge {
  position: fixed;
  bottom: 104px;
  left: 50%;
  z-index: 50;
  width: calc(100% - 24px);
  max-width: 352px;
  transform: translateX(-50%);
}

.badge-card {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.badge-icon {
  font-size: 28px;
  line-height: 1;
  margin-right: 12px;
  animation: iconPop 0.6s ease infinite alternate;
}

.badge-body {
  flex: 1;
  min-width: 0;
}

.badge-kicker {
  display: block;
  font-size: 11px;
  color: rgba(74, 222, 128, 0.85);
  font-weight: 700;
}

.badge-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-sub {
  display: block;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.55);
  margin-top: 2px;
}

.badge-chevron {
  font-size: 16px;
  color: rgba(226, 232, 240, 0.45);
  margin-left: 8px;
}

@keyframes iconPop {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.12);
  }
}
</style>

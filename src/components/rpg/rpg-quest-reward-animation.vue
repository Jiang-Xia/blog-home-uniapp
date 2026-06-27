<script lang="ts" setup>
/**
 * 任务奖励领取全屏庆祝（questReward WS）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import LotteryConfetti from './lottery/confetti.vue'

const props = defineProps<{
  visible: boolean
  questName: string
  expReward?: number
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

type RewardPhase = 'opening' | 'revealed'
const phase = ref<RewardPhase>('opening')
let revealTimer: ReturnType<typeof setTimeout> | null = null

function clearRevealTimer() {
  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

watch(
  () => props.visible,
  (v) => {
    clearRevealTimer()
    phase.value = 'opening'
    if (!v)
      return
    revealTimer = setTimeout(() => {
      phase.value = 'revealed'
      playSfx('questReward')
    }, 750)
  },
)

onUnmounted(clearRevealTimer)

function handleClose() {
  if (phase.value === 'opening')
    return
  emit('close')
}
</script>

<template>
  <view
    v-if="visible"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    :class="{ 'can-close': phase === 'revealed' }"
    @click="handleClose"
  >
    <LotteryConfetti :active="phase === 'revealed'" tier="rare" />

    <view class="reward-panel" @click.stop>
      <view v-if="phase === 'opening'" class="chest-stage">
        <view class="chest-wrap">
          <view class="chest-glow" />
          <text class="chest-lid">🎁</text>
          <text class="chest-base">📦</text>
        </view>
        <text class="chest-tip">开启奖励中…</text>
      </view>

      <cyber-card v-else class="reveal-stage cyber-card-pad-xl text-center">
        <text class="reward-badge">奖励已发放</text>
        <text class="reward-icon">✨</text>
        <text class="quest-name">{{ questName || '任务' }}</text>
        <text v-if="expReward" class="exp-reward">+{{ expReward }} EXP</text>
        <wd-button @click="handleClose">
          收下奖励
        </wd-button>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.rpg-anim-overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.72);
  overflow: hidden;
}

.reward-panel {
  position: relative;
  z-index: 3;
  text-align: center;
  min-width: 280px;
  max-width: 380px;
  padding: 0 16px;
}

.chest-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 96px;
}

.chest-glow {
  position: absolute;
  top: -16px;
  right: -16px;
  bottom: -16px;
  left: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  animation: glowPulse 0.9s ease-in-out infinite;
}

.chest-lid {
  position: relative;
  z-index: 2;
  font-size: 48px;
  line-height: 1;
  animation: lidPop 0.75s ease-in-out forwards;
}

.chest-base {
  font-size: 36px;
  line-height: 1;
  margin-top: -8px;
  opacity: 0.85;
}

.chest-tip {
  display: block;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(253, 230, 138, 0.9);
}

.reveal-stage {
  animation: revealPop 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.reward-badge {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 10px;
}

.reward-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 8px;
  animation: sparkleBounce 0.9s ease infinite;
}

.quest-name {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: #fde68a;
  margin-bottom: 10px;
}

.exp-reward {
  display: block;
  font-size: 18px;
  font-weight: 800;
  color: #f59e0b;
  margin-bottom: 20px;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes lidPop {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  70% {
    transform: translateY(-18px) rotate(-14deg) scale(1.08);
  }
  100% {
    transform: translateY(-22px) rotate(-16deg) scale(1.1);
    opacity: 0.3;
  }
}

@keyframes revealPop {
  from {
    opacity: 0;
    transform: scale(0.78);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sparkleBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.08);
  }
}
</style>

<script lang="ts" setup>
/**
 * 宠物孵化全屏动画（petHatched WS）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import { getRarityBadgePresentation } from '@/utils/rpg-rarity'
import LotteryConfetti from './lottery/confetti.vue'

const props = defineProps<{
  visible: boolean
  petName: string
  petCode?: string
  rarityLabel?: string
  rarityColor?: string
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

type HatchPhase = 'egg' | 'reveal'
const phase = ref<HatchPhase>('egg')
let hatchTimer: ReturnType<typeof setTimeout> | null = null

const tier = computed(() => {
  if (props.rarityLabel === '传说')
    return 'legendary'
  if (props.rarityLabel === '史诗')
    return 'epic'
  if (props.rarityLabel === '稀有')
    return 'rare'
  return 'common'
})

function clearHatchTimer() {
  if (hatchTimer) {
    clearTimeout(hatchTimer)
    hatchTimer = null
  }
}

watch(
  () => props.visible,
  (v) => {
    clearHatchTimer()
    phase.value = 'egg'
    if (!v)
      return
    hatchTimer = setTimeout(() => {
      phase.value = 'reveal'
      playSfx('uiClick')
    }, 1100)
  },
)

onUnmounted(clearHatchTimer)

function handleClose() {
  if (phase.value === 'egg')
    return
  emit('close')
}

const badgeStyle = computed(() => getRarityBadgePresentation(props).style)
const badgeClass = computed(() => getRarityBadgePresentation(props).class)
</script>

<template>
  <view
    v-if="visible"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    :class="{ 'can-close': phase === 'reveal' }"
    @click="handleClose"
  >
    <LotteryConfetti :active="phase === 'reveal'" :tier="tier" />

    <view class="hatch-panel" @click.stop>
      <view v-if="phase === 'egg'" class="egg-stage">
        <view class="egg-wrap">
          <view class="egg-glow" />
          <text class="egg-emoji">🥚</text>
          <view class="crack crack-1" />
          <view class="crack crack-2" />
        </view>
        <text class="egg-tip">孵化中…</text>
      </view>

      <cyber-card v-else class="reveal-stage rpg-modal-glass cyber-card-pad-xl text-center">
        <text class="hatch-badge">孵化成功</text>
        <text class="pet-icon">{{ resolveRpgItemEmoji({ icon: petCode }) }}</text>
        <view v-if="rarityLabel" class="pet-rarity" :class="badgeClass" :style="badgeStyle">
          <text class="pet-rarity-text">{{ rarityLabel }}</text>
        </view>
        <text class="pet-name">{{ petName }}</text>
        <wd-button @click="handleClose">
          太棒了！
        </wd-button>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.rpg-anim-overlay {
  overflow: hidden;
}

.hatch-panel {
  position: relative;
  z-index: 3;
  min-width: 280px;
  max-width: 360px;
  padding: 0 16px;
}

.egg-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  animation: eggShake 0.55s ease-in-out infinite;
}

.egg-glow {
  position: absolute;
  top: -12px;
  right: -12px;
  bottom: -12px;
  left: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%);
  animation: glowPulse 1.1s ease-in-out infinite;
}

.egg-emoji {
  font-size: 72px;
  line-height: 1;
}

.crack {
  position: absolute;
  width: 2px;
  height: 28px;
  background: #fef3c7;
  border-radius: 1px;
  opacity: 0;
  animation: crackShow 1.1s ease forwards;
}

.crack-1 {
  top: 38%;
  left: 46%;
  transform: rotate(-28deg);
  animation-delay: 0.35s;
}

.crack-2 {
  top: 42%;
  left: 52%;
  transform: rotate(22deg);
  animation-delay: 0.65s;
}

.egg-tip {
  display: block;
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(253, 230, 138, 0.85);
}

.reveal-stage {
  animation: revealPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.hatch-badge {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #4ade80;
  margin-bottom: 10px;
}

.pet-icon {
  display: block;
  font-size: 56px;
  margin-bottom: 8px;
  animation: petBounce 0.9s ease infinite;
}

.pet-rarity {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  margin-bottom: 10px;
}

.pet-rarity-text {
  font-size: 11px;
  font-weight: 700;
}

.pet-name {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #fde68a;
  margin-bottom: 20px;
}

@keyframes eggShake {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-6deg) scale(1.02);
  }
  75% {
    transform: rotate(6deg) scale(1.02);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes crackShow {
  0% {
    opacity: 0;
    height: 0;
  }
  100% {
    opacity: 0.9;
    height: 28px;
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

@keyframes petBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.08);
  }
}
</style>

<script lang="ts" setup>
/**
 * 抽奖庆祝彩带（纯 CSS，微信小程序粒子上限 30）
 */
import type { RarityTier } from '@/utils/rpg-rarity'

const props = withDefaults(defineProps<{
  tier?: RarityTier | 'common' | 'rare' | 'epic' | 'legendary'
  active?: boolean
}>(), {
  tier: 'common',
  active: true,
})

interface Particle {
  id: number
  left: string
  delay: string
  duration: string
  color: string
  size: string
  rotate: string
  drift: string
}

const particles = ref<Particle[]>([])

const paletteMap: Record<string, string[]> = {
  common: ['#c8d4e0', '#cbd5e1', '#e2e8f0', '#f8fafc'],
  rare: ['#22c55e', '#4ade80', '#86efac', '#dcfce7'],
  epic: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
  legendary: ['#f59e0b', '#fbbf24', '#fde68a', '#fef3c7', '#ffffff'],
}

function getMaxParticles(): number {
  // #ifdef MP-WEIXIN || MP-ALIPAY
  return 30
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY
  return 48
  // #endif
}

function getBaseCount(): number {
  const map: Record<string, number> = { common: 12, rare: 20, epic: 32, legendary: 48 }
  return map[props.tier] ?? 12
}

function buildParticles() {
  const colors = paletteMap[props.tier] ?? paletteMap.common!
  const count = Math.min(getMaxParticles(), getBaseCount())
  particles.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 0.45}s`,
    duration: `${1.6 + Math.random() * 1.4}s`,
    color: colors[i % colors.length]!,
    size: `${5 + Math.random() * 7}px`,
    rotate: `${Math.random() * 360}deg`,
    drift: `${-30 + Math.random() * 60}px`,
  }))
}

watch(
  () => [props.active, props.tier] as const,
  ([active]) => {
    if (active)
      buildParticles()
    else
      particles.value = []
  },
  { immediate: true },
)
</script>

<template>
  <view v-if="active" class="lottery-confetti">
    <view
      v-for="p in particles"
      :key="p.id"
      class="confetti-piece"
      :style="{
        'left': p.left,
        'animationDelay': p.delay,
        'animationDuration': p.duration,
        'backgroundColor': p.color,
        'width': p.size,
        'height': p.size,
        '--drift': p.drift,
        '--spin': p.rotate,
      }"
    />
    <view v-if="tier === 'legendary'" class="burst-ring" />
    <view v-if="tier === 'legendary'" class="burst-ring burst-ring--delay" />
  </view>
</template>

<style scoped>
.lottery-confetti {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.confetti-piece {
  position: absolute;
  top: -12px;
  border-radius: 2px;
  opacity: 0;
  animation-name: confettiFall;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  animation-fill-mode: forwards;
}

.burst-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  margin-top: -60px;
  margin-left: -60px;
  border: 2px solid rgba(251, 191, 36, 0.7);
  border-radius: 50%;
  animation: burstExpand 1.2s ease-out forwards;
}

.burst-ring--delay {
  animation-delay: 0.25s;
  border-color: rgba(255, 255, 255, 0.5);
}

@keyframes confettiFall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg) scale(0.4);
  }
  8% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(110vh) translateX(var(--drift)) rotate(calc(var(--spin) + 540deg)) scale(1);
  }
}

@keyframes burstExpand {
  0% {
    opacity: 0.9;
    transform: scale(0.2);
  }
  100% {
    opacity: 0;
    transform: scale(2.8);
  }
}
</style>

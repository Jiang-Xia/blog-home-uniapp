<script lang="ts" setup>
/**
 * 大额钻石增加飞入特效（currencyChange WS，delta ≥ 阈值）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  visible: boolean
  amount: number
  reason?: string
}>()

const emit = defineEmits<{ done: [] }>()

const { playSfx } = useRpgAudio()

interface CoinParticle {
  id: number
  left: string
  delay: string
  drift: string
}

const particles = ref<CoinParticle[]>([])
let doneTimer: ReturnType<typeof setTimeout> | null = null

function clearDoneTimer() {
  if (doneTimer) {
    clearTimeout(doneTimer)
    doneTimer = null
  }
}

function buildParticles(count: number) {
  const n = Math.min(10, Math.max(4, Math.round(count / 15)))
  particles.value = Array.from({ length: n }, (_, i) => ({
    id: i,
    left: `${18 + Math.random() * 64}%`,
    delay: `${Math.random() * 0.2}s`,
    drift: `${-24 + Math.random() * 48}px`,
  }))
}

watch(
  () => props.visible,
  (v) => {
    clearDoneTimer()
    if (!v || props.amount <= 0) {
      particles.value = []
      return
    }
    buildParticles(props.amount)
    playSfx('uiClick')
    doneTimer = setTimeout(() => {
      particles.value = []
      emit('done')
    }, 1400)
  },
)

onUnmounted(clearDoneTimer)
</script>

<template>
  <view v-if="visible && amount > 0" class="currency-gain-fx">
    <view class="gain-core">
      <view class="gain-glow" />
      <text class="gain-emoji">💎</text>
      <text class="gain-amount">+{{ amount }}</text>
      <text v-if="reason" class="gain-reason">{{ reason }}</text>
    </view>
    <text
      v-for="p in particles"
      :key="p.id"
      class="coin-particle"
      :style="{ 'left': p.left, 'animationDelay': p.delay, '--drift': p.drift }"
    >
      💎
    </text>
  </view>
</template>

<style scoped>
.currency-gain-fx {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 52;
  pointer-events: none;
  overflow: hidden;
}

.gain-core {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: corePop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.gain-glow {
  position: absolute;
  top: -28px;
  right: -40px;
  bottom: -28px;
  left: -40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.45) 0%, transparent 72%);
  animation: glowFade 1.2s ease-out forwards;
}

.gain-emoji {
  position: relative;
  font-size: 52px;
  line-height: 1;
  animation: gemFloat 1.1s ease-in-out infinite;
}

.gain-amount {
  position: relative;
  margin-top: 6px;
  font-size: 32px;
  font-weight: 900;
  color: #fef3c7;
}

.gain-reason {
  position: relative;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(219, 234, 254, 0.9);
}

.coin-particle {
  position: absolute;
  bottom: 28%;
  font-size: 22px;
  line-height: 1;
  opacity: 0;
  animation: coinRise 1.1s ease-out forwards;
}

@keyframes corePop {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.65);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes glowFade {
  0% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes gemFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes coinRise {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.5);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-180px) translateX(var(--drift)) scale(1);
  }
}
</style>

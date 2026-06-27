<script lang="ts" setup>
/**
 * 排行榜 Top10 变动全屏庆祝（rankChange WS）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { getRankMedalEmoji } from '@/constants/rpg-ws-display'
import { rankToConfettiTier } from '@/utils/rpg-rarity'
import LotteryConfetti from './lottery/confetti.vue'

const props = defineProps<{
  visible: boolean
  rank: number
  typeLabel?: string
  periodLabel?: string
  score?: number | null
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

watch(
  () => props.visible,
  (v) => {
    if (v)
      playSfx('uiClick')
  },
)

const medal = computed(() => getRankMedalEmoji(props.rank))
const confettiTier = computed(() => rankToConfettiTier(props.rank))

const rankTheme = computed(() => {
  const rank = props.rank
  if (rank === 1) {
    return { accent: '#92400e', heading: '#78350f' }
  }
  if (rank === 2) {
    return { accent: '#475569', heading: '#334155' }
  }
  if (rank === 3) {
    return { accent: '#9a3412', heading: '#7c2d12' }
  }
  return { accent: '#1d4ed8', heading: '#1e3a8a' }
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <view
    v-if="visible"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <LotteryConfetti :active="visible" :tier="confettiTier" />

    <view @click.stop>
      <cyber-card class="rank-modal cyber-card-pad-xl text-center">
        <text class="rank-badge" :style="{ color: rankTheme.accent }">荣登 Top10</text>
        <view class="medal-wrap">
          <text class="medal-emoji">{{ medal }}</text>
          <text class="rank-number" :style="{ color: rankTheme.heading }">{{ rank }}</text>
        </view>
        <text class="rank-title" :style="{ color: rankTheme.heading }">
          {{ periodLabel || '排行榜' }}<text v-if="typeLabel"> · {{ typeLabel }}</text>
        </text>
        <text v-if="score != null" class="rank-score" :style="{ color: rankTheme.accent }">
          积分 {{ score }}
        </text>
        <wd-button @click="handleClose">
          继续保持！
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

.rank-modal {
  min-width: 280px;
  max-width: 380px;
  animation: modalPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.rank-badge {
  display: block;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 12px;
  animation: badgePulse 1.2s ease infinite;
}

.medal-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.medal-emoji {
  font-size: 64px;
  line-height: 1;
  animation: medalBounce 0.9s ease infinite;
}

.rank-number {
  position: absolute;
  bottom: 4px;
  right: -8px;
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}

.rank-title {
  display: block;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}

.rank-score {
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.78);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes medalBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.06);
  }
}
</style>

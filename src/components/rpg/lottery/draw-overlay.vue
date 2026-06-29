<script lang="ts" setup>
/**
 * 抽奖全屏动画层（蓄力 → 滚轮 → 揭晓/汇总）
 * - 微信小程序 fixed overlay + cyber-card 面板
 */
import type { DrawResult } from '@/types/rpg'
import { formatRewardDetail } from '@/types/rpg'
import { lotteryRevealSfxKey } from '@/constants/rpg-audio'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import {
  buildReelStrip,
  getBestRarityTier,
  getCompactSpinDurationMs,
  getRarityCelebrationTier,
  getSpinPhaseFallbackMs,
  LOTTERY_PAUSE_MS,
  LOTTERY_PAUSE_MS_MULTI,
  LOTTERY_SPIN_LOOPS,
  LOTTERY_SPIN_LOOPS_COMPACT,
  LOTTERY_SPIN_MS,

} from '@/utils/lottery-reel'
import type { LotteryDrawPhase, ReelStripPlan } from '@/utils/lottery-reel'
import { getRarityFallbackColor, getRarityGlowByCode } from '@/utils/rpg-rarity'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import RpgRarityBadge from '@/components/rpg/rpg-rarity-badge.vue'
import LotteryReel from './reel.vue'
import LotteryConfetti from './confetti.vue'

const props = defineProps<{
  visible: boolean
  phase: LotteryDrawPhase
  results: DrawResult[]
  drawCount: number
}>()

const emit = defineEmits<{
  close: []
  spinComplete: []
}>()

const { playSfx } = useRpgAudio()

const reelsLanded = ref(0)
const revealReady = ref(false)
const spinCompleteEmitted = ref(false)
let spinFallbackTimer: ReturnType<typeof setTimeout> | null = null
let revealTimer: ReturnType<typeof setTimeout> | null = null

const isMulti = computed(() => props.drawCount > 1)
const currentResult = computed(() => props.results[0] ?? null)

const celebrationTier = computed(() => {
  if (props.phase === 'summary')
    return getBestRarityTier(props.results)
  return currentResult.value
    ? getRarityCelebrationTier(currentResult.value.item.rarity)
    : 'common'
})

const phaseTitle = computed(() => {
  const map: Record<LotteryDrawPhase, string> = {
    charging: '宝箱开启中…',
    spinning: isMulti.value
      ? `连抽开启中 (${reelsLanded.value}/${props.drawCount})`
      : '好运滚动中…',
    reveal: '恭喜获得',
    summary: '本轮收获',
  }
  return map[props.phase]
})

const reelPlans = computed((): ReelStripPlan[] => {
  return props.results.map((r) => {
    return buildReelStrip(
      [],
      r.item,
      isMulti.value ? LOTTERY_SPIN_LOOPS_COMPACT : LOTTERY_SPIN_LOOPS,
    )
  })
})

function clearTimers() {
  if (spinFallbackTimer) {
    clearTimeout(spinFallbackTimer)
    spinFallbackTimer = null
  }
  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

function resetSpinState() {
  reelsLanded.value = 0
  revealReady.value = false
  spinCompleteEmitted.value = false
  clearTimers()
}

function emitSpinComplete() {
  if (spinCompleteEmitted.value || props.phase !== 'spinning')
    return
  spinCompleteEmitted.value = true
  emit('spinComplete')
}

function onReelLanded() {
  reelsLanded.value += 1
  const allLanded = !isMulti.value || reelsLanded.value >= props.results.length
  if (!allLanded)
    return

  const pauseMs = isMulti.value ? LOTTERY_PAUSE_MS_MULTI : LOTTERY_PAUSE_MS
  setTimeout(() => emitSpinComplete(), pauseMs)
}

function handleOverlayTap() {
  if (props.phase === 'charging')
    return
  if (props.phase === 'spinning') {
    emitSpinComplete()
    return
  }
  emit('close')
}

function handleConfirm() {
  emit('close')
}

watch(
  () => props.visible,
  (v) => {
    if (!v)
      resetSpinState()
  },
)

watch(
  () => props.phase,
  (phase, prev) => {
    if (phase === 'charging') {
      resetSpinState()
      playSfx('uiClick')
    }
    if (phase === 'spinning') {
      resetSpinState()
      const maxSpinMs = getSpinPhaseFallbackMs(props.results.length, isMulti.value)
      clearTimers()
      spinFallbackTimer = setTimeout(() => emitSpinComplete(), maxSpinMs)
    }
    else if (prev === 'spinning') {
      clearTimers()
    }
    if (phase === 'reveal' && currentResult.value) {
      playSfx(lotteryRevealSfxKey(currentResult.value.item.rarity) as any)
      revealReady.value = false
      revealTimer = setTimeout(() => {
        revealReady.value = true
      }, 120)
    }
    if (phase === 'summary' && props.results.length) {
      playSfx(lotteryRevealSfxKey(getBestRarityTier(props.results)) as any)
    }
  },
)

onUnmounted(clearTimers)
</script>

<template>
  <view
    v-if="visible"
    class="lottery-draw-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    :class="[`phase-${phase}`, { multi: isMulti }]"
    @click="handleOverlayTap"
  >
    <view class="overlay-rays" />
    <LotteryConfetti
      :active="phase === 'reveal' || phase === 'summary'"
      :tier="celebrationTier"
    />

    <view class="draw-panel-wrap" @click.stop>
      <cyber-card class="draw-panel rpg-modal-glass cyber-card-pad-lg">
        <view class="panel-header">
          <text class="panel-title">{{ phaseTitle }}</text>
          <view
            v-if="phase === 'spinning'"
            class="skip-btn"
            @click="emitSpinComplete"
          >
            <text class="skip-btn-text">跳过</text>
          </view>
        </view>

        <view v-if="phase === 'charging'" class="charging-stage">
          <view class="charging-chest">
            <view class="chest-glow" />
            <text class="chest-emoji">🎁</text>
          </view>
          <view class="charging-rings">
            <view class="ring ring--1" />
            <view class="ring ring--2" />
            <view class="ring ring--3" />
          </view>
          <text class="charging-tip">幸运值汇聚中，请稍候…</text>
        </view>

        <view v-else-if="phase === 'spinning'" class="spinning-stage">
          <view v-if="isMulti" class="multi-reels">
            <LotteryReel
              v-for="(plan, idx) in reelPlans"
              :key="`${results[idx]?.item.code}-${idx}`"
              class="multi-reel"
              :strip="plan.strip"
              :target-index="plan.targetIndex"
              :spinning="true"
              :compact="true"
              :spin-duration-ms="getCompactSpinDurationMs(idx)"
              @landed="onReelLanded"
            />
          </view>
          <LotteryReel
            v-else-if="reelPlans[0]"
            :strip="reelPlans[0].strip"
            :target-index="reelPlans[0].targetIndex"
            :spinning="true"
            :spin-duration-ms="LOTTERY_SPIN_MS"
            @landed="onReelLanded"
          />
        </view>

        <view v-else-if="phase === 'reveal' && currentResult" class="reveal-stage">
          <view
            class="reveal-card"
            :class="{ ready: revealReady }"
            :style="{ boxShadow: getRarityGlowByCode(currentResult.item.rarity) }"
          >
            <text class="reveal-banner">✨ 恭喜获得 ✨</text>
            <view class="reveal-rarity-wrap">
              <RpgRarityBadge
                :rarity="currentResult.item.rarity"
                :rarity-label="currentResult.item.rarityLabel"
                :rarity-color="currentResult.item.rarityColor"
                :rarity-icon="currentResult.item.rarityIcon"
              />
            </view>
            <text class="reveal-item-icon">{{ resolveRpgItemEmoji(currentResult.item) }}</text>
            <text class="reveal-name">{{ currentResult.item.name }}</text>
            <text v-if="currentResult.item.description" class="reveal-desc">{{ currentResult.item.description }}</text>
            <text v-if="currentResult.rewardDetail" class="reveal-reward">{{ formatRewardDetail(currentResult.rewardDetail) }}</text>
          </view>
          <text class="reveal-hint">点击任意处收下奖励</text>
        </view>

        <view v-else-if="phase === 'summary'" class="summary-stage">
          <view class="summary-grid">
            <view
              v-for="(result, idx) in results"
              :key="`${result.item.code}-${idx}`"
              class="summary-cell"
            >
              <view
                class="summary-card"
                :style="{ borderColor: result.item.rarityColor || getRarityFallbackColor() }"
              >
                <text class="summary-item-icon">{{ resolveRpgItemEmoji(result.item) }}</text>
                <view class="summary-rarity-wrap">
                  <RpgRarityBadge
                    :rarity="result.item.rarity"
                    :rarity-label="result.item.rarityLabel"
                    :rarity-color="result.item.rarityColor"
                    :rarity-icon="result.item.rarityIcon"
                  />
                </view>
                <text class="summary-name">{{ result.item.name }}</text>
                <text v-if="result.rewardDetail" class="summary-reward">{{ formatRewardDetail(result.rewardDetail) }}</text>
              </view>
            </view>
          </view>
          <wd-button block @click="handleConfirm">
            全部收下
          </wd-button>
        </view>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.lottery-draw-overlay {
  overflow: hidden;
}

.overlay-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200vmax;
  height: 200vmax;
  margin-top: -100vmax;
  margin-left: -100vmax;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(251, 191, 36, 0.08) 30deg,
    transparent 60deg,
    rgba(139, 92, 246, 0.06) 120deg,
    transparent 150deg,
    rgba(59, 130, 246, 0.06) 210deg,
    transparent 240deg,
    rgba(251, 191, 36, 0.08) 300deg,
    transparent 330deg
  );
  animation: raysSpin 8s linear infinite;
  pointer-events: none;
}

.draw-panel-wrap {
  position: relative;
  z-index: 5;
  width: 92%;
  max-width: 420px;
}

.multi .draw-panel-wrap {
  max-width: 520px;
}

.panel-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 15px;
  font-weight: 800;
  color: #fde68a;
}

.skip-btn {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.skip-btn-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.charging-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 8px;
}

.charging-chest {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chest-glow {
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -8px;
  border-radius: 22px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.55), transparent 68%);
  animation: chestGlow 1.1s ease-in-out infinite;
}

.chest-emoji {
  position: relative;
  font-size: 52px;
  animation: chestShake 0.12s infinite alternate;
}

.charging-rings {
  position: relative;
  width: 140px;
  height: 48px;
  margin-top: 4px;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 2px solid rgba(251, 191, 36, 0.45);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ringExpand 1.6s ease-out infinite;
}

.ring--1 {
  width: 60px;
  height: 60px;
}
.ring--2 {
  width: 90px;
  height: 90px;
  animation-delay: 0.35s;
}
.ring--3 {
  width: 120px;
  height: 120px;
  animation-delay: 0.7s;
}

.charging-tip {
  margin-top: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.spinning-stage {
  min-height: 110px;
}

.multi-reels {
  display: flex;
  flex-direction: column;
}

.multi-reel {
  margin-bottom: 8px;
}

.multi-reel:last-child {
  margin-bottom: 0;
}

.reveal-stage {
  text-align: center;
  padding: 4px 0 2px;
}

.reveal-card {
  padding: 22px 20px 18px;
  border-radius: 16px;
  border: 1.5px solid rgba(148, 163, 184, 0.35);
  transform: scale(0.72);
  opacity: 0;
  transition:
    transform 0.45s cubic-bezier(0.22, 1.12, 0.36, 1),
    opacity 0.35s ease;
}

.reveal-card.ready {
  transform: scale(1);
  opacity: 1;
}

.reveal-banner {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 12px;
}

.reveal-rarity-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.reveal-item-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 12px;
}

.reveal-name {
  display: block;
  font-size: 22px;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 6px;
}

.reveal-desc {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.reveal-reward {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #4ade80;
}

.reveal-hint {
  display: block;
  margin-top: 14px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.summary-stage {
  padding: 2px 0;
}

.summary-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -6px 16px;
}

.summary-cell {
  width: 33.333%;
  box-sizing: border-box;
  padding: 0 6px 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 10px;
  border-width: 1.5px;
  border-style: solid;
  background: rgba(15, 23, 42, 0.88);
  animation: cardPop 0.4s cubic-bezier(0.22, 1.1, 0.36, 1) both;
}

.summary-item-icon {
  font-size: 24px;
  margin-bottom: 4px;
  line-height: 1;
}

.summary-rarity-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
  transform: scale(0.92);
}

.summary-name {
  font-size: 11px;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.summary-reward {
  font-size: 10px;
  color: #4ade80;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
  line-height: 1.25;
}

@keyframes raysSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes chestGlow {
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

@keyframes chestShake {
  from {
    transform: rotate(-4deg) scale(1.04);
  }
  to {
    transform: rotate(4deg) scale(1.04);
  }
}

@keyframes ringExpand {
  0% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(0.6);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes cardPop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

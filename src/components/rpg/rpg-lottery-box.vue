<script lang="ts" setup>
/**
 * 抽奖宝箱主面板（对齐 Nuxt LotteryBox.vue）
 * - 单抽/十连、券/钻石切换、保底计数、抽奖记录
 * - 动画分阶段由 lottery/draw-overlay 承载
 */
import type { DrawResult, LotteryPoolItem, LotteryRecord, RpgStatus } from '@/types/rpg'
import type { LotteryDrawPhase } from '@/utils/lottery-reel'
import { formactDate } from '@/utils/date-time'
import {
  LOTTERY_CURRENCY_COST,
  LOTTERY_EPIC_PITY_THRESHOLD,
  LOTTERY_LEGENDARY_PITY_THRESHOLD,
} from '@/utils/rpg-economy'
import { useRpgRecharge } from '@/composables/use-rpg-recharge'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { getRarityBadgePresentation, getRarityFallbackColor } from '@/utils/rpg-rarity'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import LotteryDrawOverlay from './lottery/draw-overlay.vue'

const props = defineProps<{
  lotteryPool: LotteryPoolItem[]
  lotteryTickets: number
  rpgStatus: RpgStatus | null
  lotteryHistory: LotteryRecord[]
  drawing: boolean
}>()

const emit = defineEmits<{
  draw: [count: number, currency: 'ticket' | 'currency']
  loadHistory: []
  finished: [results: DrawResult[]]
}>()

const drawCurrency = ref<'ticket' | 'currency'>('currency')
const { openRechargeModal } = useRpgRecharge()
const { playSfx } = useRpgAudio()

const drawResults = ref<DrawResult[]>([])
const drawPhase = ref<LotteryDrawPhase | 'idle'>('idle')
const pendingCount = ref(1)
const showHistory = ref(false)

const showOverlay = computed(() => drawPhase.value !== 'idle')
const isAnimating = computed(() => drawPhase.value !== 'idle')
const overlayPhase = computed(() => (drawPhase.value === 'idle' ? 'charging' : drawPhase.value))

function setDrawCurrency(currency: 'ticket' | 'currency') {
  if (drawCurrency.value === currency)
    return
  playSfx('tabSwitch')
  drawCurrency.value = currency
}

function canDraw(count: number) {
  if (drawCurrency.value === 'currency')
    return (props.rpgStatus?.currency || 0) >= count * LOTTERY_CURRENCY_COST
  return props.lotteryTickets >= count
}

function isDrawDisabled(count: number) {
  if (props.drawing || isAnimating.value)
    return true
  if (drawCurrency.value === 'ticket')
    return !canDraw(count)
  return false
}

function goToResultPhase() {
  drawPhase.value = pendingCount.value > 1 ? 'summary' : 'reveal'
}

function finishDrawAnimation() {
  const results = [...drawResults.value]
  drawPhase.value = 'idle'
  drawResults.value = []
  emit('finished', results)
}

function handleDraw(count = 1) {
  if (props.drawing || isAnimating.value)
    return
  if (drawCurrency.value === 'currency' && !canDraw(count)) {
    openRechargeModal()
    return
  }
  if (!canDraw(count))
    return

  pendingCount.value = count
  drawResults.value = []
  drawPhase.value = 'charging'
  playSfx('uiClick')
  emit('draw', count, drawCurrency.value)
}

defineExpose({
  showDrawResults: (results: DrawResult[]) => {
    if (!results.length) {
      finishDrawAnimation()
      return
    }
    drawResults.value = results
    drawPhase.value = 'spinning'
  },
  cancelDrawAnimation: () => {
    finishDrawAnimation()
  },
})

function onSpinComplete() {
  if (drawPhase.value === 'spinning')
    goToResultPhase()
}

function onOverlayClose() {
  finishDrawAnimation()
}

function toggleHistory() {
  showHistory.value = !showHistory.value
  playSfx('tabSwitch')
  if (showHistory.value && props.lotteryHistory.length === 0)
    emit('loadHistory')
}

function badgeStyle(fields: { rarity?: string, rarityLabel?: string, rarityColor?: string }) {
  return getRarityBadgePresentation(fields).style
}

function badgeClass(fields: { rarity?: string, rarityLabel?: string, rarityColor?: string }) {
  return getRarityBadgePresentation(fields).class
}
</script>

<template>
  <view class="lottery-section">
    <view class="lottery-header">
      <text class="section-title">🎁 幸运宝箱</text>
      <text class="ticket-count">🎫 {{ lotteryTickets }} · 💎 {{ rpgStatus?.currency ?? 0 }}</text>
    </view>

    <view
      v-if="rpgStatus?.lotteryPityCounter != null || rpgStatus?.lotteryLegendaryPityCounter != null"
      class="pity-row"
    >
      <text v-if="rpgStatus?.lotteryPityCounter != null" class="pity-text">
        史诗保底 {{ rpgStatus.lotteryPityCounter }} / {{ LOTTERY_EPIC_PITY_THRESHOLD }}
      </text>
      <text v-if="rpgStatus?.lotteryLegendaryPityCounter != null" class="pity-text pity-text--spaced">
        传说保底 {{ rpgStatus.lotteryLegendaryPityCounter }} / {{ LOTTERY_LEGENDARY_PITY_THRESHOLD }}
      </text>
    </view>

    <view class="currency-tabs">
      <view
        class="currency-tab"
        :class="{ active: drawCurrency === 'ticket' }"
        @click="setDrawCurrency('ticket')"
      >
        <text>抽奖券</text>
      </view>
      <view
        class="currency-tab"
        :class="{ active: drawCurrency === 'currency' }"
        @click="setDrawCurrency('currency')"
      >
        <text>钻石(10/抽)</text>
      </view>
    </view>

    <view class="chest-area">
      <view
        class="chest"
        :class="{
          charging: drawPhase === 'charging',
          spinning: drawPhase === 'spinning',
          disabled: isAnimating || drawing,
        }"
        @click="!isAnimating && !drawing && handleDraw(1)"
      >
        <view v-if="drawPhase === 'charging'" class="chest-aura" />
        <view class="chest-body">
          <text class="chest-icon">
            {{ drawPhase === 'charging' ? '✨' : drawPhase === 'spinning' ? '🎲' : '🎁' }}
          </text>
          <text v-if="!isAnimating" class="chest-label">点击开启</text>
          <text v-else class="chest-label chest-label--active">
            {{ drawPhase === 'charging' ? '开启中…' : '抽奖中…' }}
          </text>
        </view>
      </view>

      <view class="draw-actions">
        <view class="draw-btn-wrap">
          <wd-button size="small" :disabled="isDrawDisabled(1)" @click="handleDraw(1)">
            单抽 x1
          </wd-button>
        </view>
        <view class="draw-btn-wrap">
          <wd-button size="small" :disabled="isDrawDisabled(10)" @click="handleDraw(10)">
            十连 x10
          </wd-button>
        </view>
      </view>
    </view>

    <LotteryDrawOverlay
      :visible="showOverlay"
      :phase="overlayPhase"
      :results="drawResults"
      :draw-count="pendingCount"
      @spin-complete="onSpinComplete"
      @close="onOverlayClose"
    />

    <cyber-card class="pool-preview cyber-card-pad-sm">
      <text class="pool-title">奖池一览</text>
      <view class="pool-grid">
        <view
          v-for="item in lotteryPool"
          :key="item.id"
          class="pool-chip"
          :style="{ borderColor: item.rarityColor || getRarityFallbackColor() }"
        >
          <text class="pool-chip-icon">{{ resolveRpgItemEmoji(item) }}</text>
          <view
            class="pool-chip-badge"
            :class="badgeClass(item)"
            :style="badgeStyle(item)"
          >
            <text class="pool-chip-badge-text">{{ item.rarityLabel || item.rarity }}</text>
          </view>
          <text class="pool-chip-name">{{ item.name }}</text>
        </view>
      </view>
    </cyber-card>

    <view class="history-toggle">
      <view class="history-btn" @click="toggleHistory">
        <text>📜 抽奖记录 {{ showHistory ? '▼' : '▶' }}</text>
      </view>
      <view v-if="showHistory" class="history-list">
        <text v-if="lotteryHistory.length === 0" class="history-empty">暂无记录</text>
        <view
          v-for="record in lotteryHistory"
          :key="record.id"
          class="history-row"
        >
          <text class="history-icon">{{ resolveRpgItemEmoji(record) }}</text>
          <view
            class="history-rarity"
            :class="badgeClass(record)"
            :style="badgeStyle(record)"
          >
            <text class="history-rarity-text">{{ record.rarityLabel || record.poolRarity }}</text>
          </view>
          <text class="history-name">{{ record.poolName }}</text>
          <text class="history-time">{{ formactDate(record.createTime) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.lottery-section {
  margin-top: 12px;
}

.lottery-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}

.ticket-count {
  font-size: 13px;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(139, 92, 246, 0.15);
  padding: 3px 10px;
  border-radius: 12px;
}

.pity-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.pity-text {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.6);
}

.pity-text--spaced {
  margin-left: 12px;
}

.currency-tabs {
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
}

.currency-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  margin-right: 8px;
  font-size: 13px;
  color: rgba(226, 232, 240, 0.7);
}

.currency-tab:last-child {
  margin-right: 0;
}

.currency-tab.active {
  background: rgba(139, 92, 246, 0.25);
  color: #fde68a;
  font-weight: 700;
}

.chest-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.chest {
  width: 108px;
  height: 108px;
  border-radius: 18px;
  background: rgba(245, 158, 11, 0.12);
  border: 2px solid rgba(245, 158, 11, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 12px;
}

.chest.charging {
  animation: chestCharge 0.14s infinite alternate;
}

.chest.disabled {
  opacity: 0.88;
}

.chest-aura {
  position: absolute;
  top: -10px;
  right: -10px;
  bottom: -10px;
  left: -10px;
  border-radius: 22px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%);
  animation: auraPulse 1s ease-in-out infinite;
}

.chest-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.chest-icon {
  font-size: 38px;
}

.chest-label {
  font-size: 10px;
  color: #fbbf24;
  font-weight: 600;
  margin-top: 2px;
}

.chest-label--active {
  color: #d97706;
}

.draw-actions {
  display: flex;
  flex-direction: row;
}

.draw-btn-wrap {
  margin-right: 8px;
}

.draw-btn-wrap:last-child {
  margin-right: 0;
}

.pool-preview {
  margin-bottom: 12px;
}

.pool-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.65);
  margin-bottom: 8px;
  text-align: center;
}

.pool-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-right: -8px;
}

.pool-chip {
  width: calc(33.33% - 8px);
  margin-right: 8px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 10px;
  border-width: 1.5px;
  border-style: solid;
  background: rgba(15, 23, 42, 0.5);
}

.pool-chip-icon {
  font-size: 22px;
}

.pool-chip-badge {
  margin-top: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
}

.pool-chip-badge-text {
  font-size: 9px;
  font-weight: 700;
}

.pool-chip-name {
  font-size: 10px;
  color: #e2e8f0;
  text-align: center;
  margin-top: 4px;
}

.history-toggle {
  margin-top: 8px;
}

.history-btn {
  font-size: 12px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.65);
  margin-bottom: 6px;
}

.history-list {
  max-height: 200px;
}

.history-empty {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.5);
  padding: 8px 0;
}

.history-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.history-icon {
  font-size: 18px;
  margin-right: 8px;
}

.history-rarity {
  padding: 1px 6px;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  margin-right: 8px;
}

.history-rarity-text {
  font-size: 9px;
  font-weight: 700;
}

.history-name {
  flex: 1;
  font-size: 12px;
  color: #e2e8f0;
}

.history-time {
  font-size: 10px;
  color: rgba(226, 232, 240, 0.45);
  margin-left: 8px;
}

@keyframes chestCharge {
  from {
    transform: rotate(-2deg) scale(1.03);
  }
  to {
    transform: rotate(2deg) scale(1.06);
  }
}

@keyframes auraPulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}
</style>

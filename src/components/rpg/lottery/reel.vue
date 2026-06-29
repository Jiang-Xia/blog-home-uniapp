<script lang="ts" setup>
/**
 * 横向抽奖滚轮槽（uni-app / 微信小程序）
 * - 父组件传入 strip + targetIndex，CSS transform + calcReelOffset 驱动滚动
 */
import { getCurrentInstance, nextTick } from 'vue'
import type { ReelStripItem } from '@/utils/lottery-reel'
import {
  calcReelOffset,
  LOTTERY_REEL_ITEM_GAP,
  LOTTERY_REEL_ITEM_WIDTH,
  LOTTERY_SPIN_MS,
} from '@/utils/lottery-reel'
import { getRarityFallbackColor } from '@/utils/rpg-rarity'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import RpgRarityBadge from '@/components/rpg/rpg-rarity-badge.vue'

const props = withDefaults(defineProps<{
  strip: ReelStripItem[]
  targetIndex?: number
  spinning: boolean
  compact?: boolean
  spinDurationMs?: number
}>(), {
  compact: false,
  spinDurationMs: LOTTERY_SPIN_MS,
})

const emit = defineEmits<{ landed: [] }>()

const offsetPx = ref(0)
const isMoving = ref(false)
const hasLanded = ref(false)
const viewportWidth = ref(0)

const itemWidth = computed(() => (props.compact ? 76 : LOTTERY_REEL_ITEM_WIDTH))
const itemGap = computed(() => (props.compact ? 10 : LOTTERY_REEL_ITEM_GAP))
const itemHeight = computed(() => (props.compact ? 62 : 80))

const resolvedTargetIndex = computed(() => {
  if (props.targetIndex != null)
    return props.targetIndex
  const winIdx = props.strip.findIndex(item => item.id.endsWith('-win'))
  return winIdx >= 0 ? winIdx : Math.max(props.strip.length - 5, 0)
})

const stripStyle = computed(() => ({
  transform: `translateX(-${offsetPx.value}px)`,
  transition: isMoving.value ? `transform ${props.spinDurationMs}ms cubic-bezier(0.06, 0.78, 0.12, 1)` : 'none',
}))

let landTimer: ReturnType<typeof setTimeout> | null = null
let spinToken = ''

function clearLandTimer() {
  if (landTimer) {
    clearTimeout(landTimer)
    landTimer = null
  }
}

function resetReel() {
  clearLandTimer()
  spinToken = ''
  isMoving.value = false
  hasLanded.value = false
  offsetPx.value = 0
}

function measureViewport(): Promise<number> {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .in(getCurrentInstance()?.proxy as any)
      .select('.reel-viewport')
      .boundingClientRect((rect) => {
        const w = rect && !Array.isArray(rect) ? rect.width : 0
        viewportWidth.value = w || 300
        resolve(viewportWidth.value)
      })
      .exec()
  })
}

function finishSpin(token: string, target: number) {
  if (spinToken !== token || hasLanded.value)
    return
  clearLandTimer()
  offsetPx.value = target
  isMoving.value = false
  hasLanded.value = true
  emit('landed')
}

async function runSpin() {
  if (!props.spinning || !props.strip.length)
    return

  const token = `${resolvedTargetIndex.value}:${props.spinDurationMs}`
  if (spinToken === token && hasLanded.value)
    return

  spinToken = token
  clearLandTimer()
  hasLanded.value = false
  isMoving.value = false
  offsetPx.value = 0

  await nextTick()
  const vw = await measureViewport()
  const target = calcReelOffset(resolvedTargetIndex.value, vw, itemWidth.value, itemGap.value)

  await nextTick()
  if (spinToken !== token)
    return

  isMoving.value = true
  offsetPx.value = target
  landTimer = setTimeout(() => finishSpin(token, target), props.spinDurationMs + 120)
}

watch(
  () => `${props.spinning}:${resolvedTargetIndex.value}:${props.spinDurationMs}:${props.strip.length}`,
  (val) => {
    if (!props.spinning) {
      resetReel()
      return
    }
    runSpin()
  },
  { immediate: true },
)

onUnmounted(resetReel)
</script>

<template>
  <view
    class="lottery-reel"
    :class="{ compact, landed: hasLanded, moving: isMoving }"
    :style="{
      '--item-w': `${itemWidth}px`,
      '--item-h': `${itemHeight}px`,
      '--item-gap': `${itemGap}px`,
    }"
  >
    <view class="reel-pointer reel-pointer--left" />
    <view class="reel-pointer reel-pointer--right" />
    <view class="reel-highlight" />

    <view class="reel-viewport">
      <view class="reel-strip" :style="stripStyle">
        <view
          v-for="item in strip"
          :key="item.id"
          class="reel-item"
          :style="{ borderColor: item.rarityColor || getRarityFallbackColor() }"
        >
          <text class="reel-item-icon">{{ resolveRpgItemEmoji(item) }}</text>
          <text v-if="!compact" class="reel-name">{{ item.name }}</text>
          <view class="reel-badge-wrap">
            <RpgRarityBadge
              :rarity="item.rarity"
              :rarity-label="item.rarityLabel"
              :rarity-color="item.rarityColor"
              :rarity-icon="item.rarityIcon"
            />
          </view>
        </view>
      </view>
      <view v-if="!strip.length" class="reel-placeholder">
        <view class="placeholder-dot" />
        <view class="placeholder-dot placeholder-dot--2" />
        <view class="placeholder-dot placeholder-dot--3" />
      </view>
    </view>

    <view v-if="isMoving" class="reel-blur" />
  </view>
</template>

<style scoped>
.lottery-reel {
  position: relative;
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 0;
  overflow: hidden;
}

.lottery-reel.compact {
  padding: 8px 0;
  border-radius: 12px;
}

.reel-viewport {
  position: relative;
  width: 100%;
  height: var(--item-h);
  overflow: hidden;
}

.reel-strip {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
  will-change: transform;
}

.reel-item {
  box-sizing: border-box;
  flex-shrink: 0;
  width: var(--item-w);
  min-width: var(--item-w);
  max-width: var(--item-w);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  margin-right: var(--item-gap);
  border-radius: 10px;
  border-width: 1.5px;
  border-style: solid;
  background: rgba(30, 41, 59, 0.88);
}

.compact .reel-item {
  border-radius: 11px;
  border-width: 2px;
  padding: 6px 8px 7px;
  justify-content: space-between;
}

.reel-item-icon {
  font-size: 22px;
  line-height: 1;
}

.compact .reel-item-icon {
  font-size: 18px;
}

.reel-name {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 3px;
}

.reel-badge-wrap {
  margin-top: 3px;
  display: flex;
  justify-content: center;
  max-width: 100%;
  transform: scale(0.85);
}

.compact .reel-badge-wrap {
  transform: scale(0.84);
  flex-shrink: 0;
}

.reel-highlight {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 50%;
  width: var(--item-w);
  transform: translateX(-50%);
  border: 2px solid #fde68a;
  border-radius: 12px;
  pointer-events: none;
  z-index: 3;
}

.reel-pointer {
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  transform: translateY(-50%);
  z-index: 4;
}

.reel-pointer--left {
  left: calc(50% - var(--item-w) / 2 - 14px);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid #fde68a;
}

.reel-pointer--right {
  left: calc(50% + var(--item-w) / 2 + 4px);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #fde68a;
}

.reel-blur {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  animation: reelShine 0.55s linear infinite;
  pointer-events: none;
  z-index: 2;
}

.lottery-reel.landed .reel-highlight {
  animation: highlightPulse 0.9s ease-in-out infinite;
}

.reel-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.placeholder-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fde68a;
  animation: dotPulse 0.9s ease-in-out infinite;
  margin-left: 8px;
}

.placeholder-dot:first-child {
  margin-left: 0;
}

.placeholder-dot--2 {
  animation-delay: 0.15s;
}

.placeholder-dot--3 {
  animation-delay: 0.3s;
}

@keyframes reelShine {
  from {
    transform: translateX(-120%);
  }
  to {
    transform: translateX(120%);
  }
}

@keyframes highlightPulse {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
</style>

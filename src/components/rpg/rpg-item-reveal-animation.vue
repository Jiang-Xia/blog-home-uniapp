<script lang="ts" setup>
/**
 * 史诗/传说物品获得全屏揭晓（itemGranted WS，非抽奖来源）
 */
import type { RarityDisplayFields } from '@/types/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { lotteryRevealSfxKey } from '@/constants/rpg-audio'
import { getRarityBadgePresentation, getRarityGlow, rarityLabelToTier } from '@/utils/rpg-rarity'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import LotteryConfetti from './lottery/confetti.vue'

export interface ItemRevealData extends RarityDisplayFields {
  code?: string
  name?: string
  icon?: string
  itemTypeIcon?: string
  itemTypeLabel?: string
  quantity?: number
  sourceLabel?: string
}

const props = defineProps<{
  visible: boolean
  item: ItemRevealData | null
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

const revealReady = ref(false)
let readyTimer: ReturnType<typeof setTimeout> | null = null

const tier = computed(() => rarityLabelToTier(props.item?.rarityLabel))
const glowStyle = computed(() => ({ boxShadow: getRarityGlow(tier.value) }))

function clearReadyTimer() {
  if (readyTimer) {
    clearTimeout(readyTimer)
    readyTimer = null
  }
}

watch(
  () => props.visible,
  (v) => {
    clearReadyTimer()
    revealReady.value = false
    if (!v || !props.item)
      return
    if (props.item.rarity)
      playSfx(lotteryRevealSfxKey(props.item.rarity) as any)
    readyTimer = setTimeout(() => {
      revealReady.value = true
    }, 120)
  },
)

onUnmounted(clearReadyTimer)

function handleClose() {
  emit('close')
}

const badgeStyle = computed(() => props.item ? getRarityBadgePresentation(props.item).style : undefined)
const badgeClass = computed(() => props.item ? getRarityBadgePresentation(props.item).class : undefined)
</script>

<template>
  <view
    v-if="visible && item"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view class="overlay-rays" />
    <LotteryConfetti :active="visible" :tier="tier" />

    <view class="reveal-panel" @click.stop>
      <cyber-card
        class="reveal-card rpg-modal-glass cyber-card-pad-xl text-center"
        :class="{ ready: revealReady }"
        :style="glowStyle"
      >
        <text class="reveal-banner">✨ 恭喜获得 ✨</text>
        <view
          v-if="item.rarityLabel || item.rarity"
          class="reveal-rarity"
          :class="badgeClass"
          :style="badgeStyle"
        >
          <text class="reveal-rarity-text">{{ item.rarityLabel || item.rarity }}</text>
        </view>
        <text class="reveal-item-icon">{{ resolveRpgItemEmoji(item) }}</text>
        <text class="reveal-name">{{ item.name || item.code }}</text>
        <text v-if="item.itemTypeLabel" class="reveal-meta">
          {{ item.itemTypeLabel }} · x{{ item.quantity ?? 1 }}
        </text>
        <text v-if="item.sourceLabel" class="reveal-source">来源：{{ item.sourceLabel }}</text>
      </cyber-card>
      <text class="reveal-hint">点击任意处收下奖励</text>
    </view>
  </view>
</template>

<style scoped>
.rpg-anim-overlay {
  overflow: hidden;
}

.overlay-rays {
  position: absolute;
  top: -20%;
  right: -20%;
  bottom: -20%;
  left: -20%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(251, 191, 36, 0.08) 30deg,
    transparent 60deg,
    rgba(139, 92, 246, 0.06) 120deg,
    transparent 150deg
  );
  animation: raysSpin 8s linear infinite;
  pointer-events: none;
}

.reveal-panel {
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 0 16px;
  max-width: 420px;
  width: 100%;
}

.reveal-card {
  transform: scale(0.82);
  opacity: 0;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
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
  color: #fde68a;
  margin-bottom: 16px;
}

.reveal-rarity {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  margin-bottom: 10px;
}

.reveal-rarity-text {
  font-size: 11px;
  font-weight: 700;
}

.reveal-item-icon {
  display: block;
  font-size: 56px;
  margin-bottom: 12px;
}

.reveal-name {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 8px;
}

.reveal-meta {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.reveal-source {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.reveal-hint {
  display: block;
  margin-top: 18px;
  font-size: 12px;
  color: rgba(248, 250, 252, 0.55);
}

@keyframes raysSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>

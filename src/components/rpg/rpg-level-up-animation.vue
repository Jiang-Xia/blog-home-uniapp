<script lang="ts" setup>
/**
 * 升级全屏庆祝动画（WS levelUp / 签到升级）
 * - tap 关闭；unlockedRewards 已由后端 enrich
 */
import type { LevelUpResult } from '@/types/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'

const props = defineProps<{
  visible: boolean
  levelUpData: LevelUpResult | null
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

watch(
  () => props.visible,
  (v) => {
    if (v && props.levelUpData)
      playSfx('levelUp')
  },
)

const rewards = computed(() => {
  if (!props.levelUpData?.unlockedRewards?.length)
    return []
  return props.levelUpData.unlockedRewards.map(r => ({
    level: r.level,
    currencyReward: r.currencyReward || 0,
    currencyName: r.currencyName || '钻石',
    frameName: r.avatarFrame?.name || null,
    frameEmoji: r.avatarFrame ? resolveRpgItemEmoji(r.avatarFrame) : null,
    titleName: r.title?.name || null,
    titleEmoji: r.title ? resolveRpgItemEmoji(r.title) : null,
  }))
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <view
    v-if="visible && levelUpData"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view @click.stop>
      <cyber-card class="level-up-modal rpg-modal-glass cyber-card-pad-xl text-center">
        <text class="level-up-icon">⭐</text>
        <text class="level-up-badge">升级！</text>
        <view class="level-up-numbers">
          <text class="old-level">LV{{ levelUpData.oldLevel }}</text>
          <text class="arrow">→</text>
          <text class="new-level">LV{{ levelUpData.newLevel }}</text>
        </view>
        <view v-if="rewards.length" class="level-up-rewards">
          <text class="rewards-title">解锁奖励</text>
          <view v-for="r in rewards" :key="r.level" class="reward-item">
            <text v-if="r.currencyReward" class="reward-line">💎 {{ r.currencyReward }} {{ r.currencyName }}</text>
            <text v-if="r.frameName" class="reward-line">{{ r.frameEmoji }} {{ r.frameName }}</text>
            <text v-if="r.titleName" class="reward-line">{{ r.titleEmoji }} {{ r.titleName }}</text>
          </view>
        </view>
        <wd-button @click="handleClose">
          确定
        </wd-button>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.level-up-modal {
  min-width: 280px;
  max-width: 380px;
  animation: modalGlow 2.4s ease-in-out infinite;
}

.level-up-icon {
  display: block;
  font-size: 52px;
  animation: iconBounce 0.85s ease infinite;
}

.level-up-badge {
  display: block;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #fde68a;
  margin-top: 6px;
  margin-bottom: 12px;
}

.level-up-numbers {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.old-level {
  font-size: 32px;
  font-weight: 900;
  color: rgba(253, 230, 138, 0.6);
  text-decoration: line-through;
}

.arrow {
  font-size: 24px;
  color: #fbbf24;
  margin-left: 8px;
  margin-right: 8px;
}

.new-level {
  font-size: 36px;
  font-weight: 900;
  color: #fde68a;
}

.level-up-rewards {
  margin-bottom: 20px;
}

.rewards-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: rgba(253, 230, 138, 0.85);
  margin-bottom: 8px;
}

.reward-item {
  margin-bottom: 4px;
}

.reward-line {
  display: block;
  font-size: 14px;
  color: #fbbf24;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.12);
  }
}

@keyframes modalGlow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}
</style>

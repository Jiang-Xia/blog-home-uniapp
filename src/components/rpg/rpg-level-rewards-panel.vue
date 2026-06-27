<script lang="ts" setup>
/**
 * 等级奖励路线图（对齐 blog-home-nuxt LevelRewardsPanel）
 * 直接使用 API 返回的 avatarFrame/title/currencyName，不做本地物品 map
 */
import type { LevelReward } from '@/types/rpg'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'

const props = defineProps<{
  levelRewards: LevelReward[]
  currentLevel: number
  loading?: boolean
}>()

const unlockedCount = computed(
  () => props.levelRewards.filter(r => props.currentLevel >= r.level).length,
)

const unlockPercent = computed(() =>
  props.levelRewards.length > 0
    ? Math.round((unlockedCount.value / props.levelRewards.length) * 100)
    : 0,
)

function isUnlocked(level: number) {
  return props.currentLevel >= level
}

function hasAnyReward(reward: LevelReward) {
  return !!(reward.currencyReward || reward.avatarFrame?.name || reward.title?.name)
}
</script>

<template>
  <view class="level-rewards-panel">
    <view class="level-rewards-panel__header u-flex-row-center flex items-center justify-between">
      <view>
        <view class="u-flex-row-center">
          <text class="level-rewards-panel__num">{{ unlockedCount }}</text>
          <text class="level-rewards-panel__total">/{{ levelRewards.length }}</text>
        </view>
        <text class="level-rewards-panel__label">已解锁等级奖励</text>
      </view>
      <view class="level-rewards-panel__ring">
        <text class="level-rewards-panel__ring-text">{{ unlockPercent }}%</text>
      </view>
    </view>

    <view v-if="loading" class="level-rewards-panel__loading">
      <text class="text-sm text-tech-subtle">加载中…</text>
    </view>
    <view v-else-if="levelRewards.length === 0" class="level-rewards-panel__empty">
      <text class="text-sm text-tech-subtle">暂无等级奖励配置</text>
    </view>
    <view v-else class="u-grid-2 u-grid-2--loose">
      <view
        v-for="reward in levelRewards"
        :key="reward.level"
        class="u-grid-2-item"
      >
        <cyber-card
          class="reward-card cyber-card-pad-sm"
          :class="isUnlocked(reward.level) ? 'reward-card--gold' : 'reward-card--locked'"
        >
          <view class="u-flex-row-center flex items-center justify-between">
            <text class="reward-card__lv">LV{{ reward.level }}</text>
            <text v-if="isUnlocked(reward.level)" class="text-xs text-green-400">✓ 已达成</text>
            <text v-else class="text-xs text-tech-subtle">🔒 未解锁</text>
          </view>
          <text class="reward-card__title mt-2 block text-sm text-tech font-medium">
            等级 {{ reward.level }} 奖励
          </text>
          <view class="u-stack-1 mt-2">
            <text
              v-if="reward.currencyReward"
              class="reward-chip reward-chip--diamond"
            >
              💎 {{ reward.currencyReward }} {{ reward.currencyName || '钻石' }}
            </text>
            <text
              v-if="reward.avatarFrame?.name"
              class="reward-chip reward-chip--frame"
              :style="reward.avatarFrame.color ? { borderColor: reward.avatarFrame.color } : undefined"
            >
              {{ resolveRpgItemEmoji(reward.avatarFrame) }} {{ reward.avatarFrame.name }}
            </text>
            <text v-if="reward.title?.name" class="reward-chip reward-chip--title">
              {{ resolveRpgItemEmoji(reward.title) }} {{ reward.title.name }}
            </text>
            <text v-if="!hasAnyReward(reward)" class="text-xs text-tech-subtle">暂无奖励</text>
          </view>
          <text class="reward-card__footer mt-2 block text-xs">
            <text v-if="isUnlocked(reward.level)" class="text-green-400">奖励已解锁</text>
            <text v-else class="text-tech-subtle">还需 {{ reward.level - currentLevel }} 级</text>
          </text>
        </cyber-card>
      </view>
    </view>
  </view>
</template>

<style scoped>
.level-rewards-panel__num {
  font-size: 24px;
  font-weight: 900;
  color: #fbbf24;
}

.level-rewards-panel__total {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.level-rewards-panel__label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.level-rewards-panel__ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
}

.level-rewards-panel__ring-text {
  font-size: 10px;
  font-weight: 700;
  color: #fbbf24;
}

.level-rewards-panel__loading,
.level-rewards-panel__empty {
  padding: 16px;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.reward-card--gold {
  border-color: rgba(251, 191, 36, 0.35);
}

.reward-card--locked {
  opacity: 0.85;
}

.reward-card__lv {
  font-weight: 800;
  font-size: 13px;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.reward-chip {
  display: block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
}

.reward-chip--diamond {
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.reward-chip--frame {
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reward-chip--title {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
}
</style>

<script lang="ts" setup>
/**
 * RPG 成就面板 — 双列战利品卡片，对齐 blog-home-nuxt AchievementPanel
 */
import RpgRarityBadge from '@/components/rpg/rpg-rarity-badge.vue'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { ACHIEVEMENT_CATEGORY_MAP, ACHIEVEMENT_ICON_MAP } from '@/types/rpg'
import type { UserAchievementProgress } from '@/types/rpg'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'
import {
  getRarityFallbackColor,
  isSilverRarityColor,
  shouldUseSilverRarityStyle,
} from '@/utils/rpg-rarity'

const props = defineProps<{
  achievements: UserAchievementProgress[]
}>()

const { playSfx } = useRpgAudio()

const groupedAchievements = computed(() => {
  const groups: Record<string, UserAchievementProgress[]> = {}
  for (const a of props.achievements) {
    if (!groups[a.category])
      groups[a.category] = []
    groups[a.category]!.push(a)
  }
  return groups
})

const totalCount = computed(() => props.achievements.length)
const completedCount = computed(() => props.achievements.filter(a => a.completed).length)
const completionPercent = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
)

const activeCategory = ref<string>('all')
const showLocked = ref(false)

const categories = computed(() =>
  Object.keys(groupedAchievements.value).map(key => ({
    key,
    label: ACHIEVEMENT_CATEGORY_MAP[key] || key,
    count: groupedAchievements.value[key]?.length || 0,
    completed: groupedAchievements.value[key]?.filter(a => a.completed).length || 0,
  })),
)

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all')
    return props.achievements
  return groupedAchievements.value[activeCategory.value] || []
})

const displayedAchievements = computed(() => {
  const list = filteredAchievements.value
  if (showLocked.value)
    return list
  return list.filter(a => a.completed || a.progress > 0)
})

const hiddenLockedCount = computed(
  () => filteredAchievements.value.filter(a => !a.completed && a.progress === 0).length,
)

function switchCategory(key: string) {
  if (key !== activeCategory.value)
    void playSfx('tabSwitch')
  activeCategory.value = key
}

function achievementIconStyle(ach: UserAchievementProgress) {
  if (shouldUseSilverRarityStyle(ach) || isSilverRarityColor(ach.rarityColor))
    return undefined
  return { background: ach.rarityColor || getRarityFallbackColor() }
}

function achievementEmoji(ach: UserAchievementProgress) {
  const key = ACHIEVEMENT_ICON_MAP[ach.icon] || ach.icon || 'trophy'
  return resolveRpgItemEmoji({ icon: key })
}

function progressPercent(ach: UserAchievementProgress) {
  const max = ach.maxProgress || 1
  return Math.min(100, Math.round((ach.progress / max) * 100))
}
</script>

<template>
  <view class="achievement-panel mt-4">
    <text class="mb-2 block text-tech font-medium">成就</text>

    <view class="ach-overview u-flex-row-center flex items-center justify-between">
      <view>
        <view class="u-flex-row-center">
          <text class="ach-num">{{ completedCount }}</text>
          <text class="ach-total">/{{ totalCount }}</text>
        </view>
        <text class="ach-label">已完成成就</text>
      </view>
      <view class="ach-progress-ring">
        <text class="ach-ring-text">{{ completionPercent }}%</text>
      </view>
    </view>

    <view class="rpg-panel-tabs ach-tabs">
      <text
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="activeCategory === 'all' ? 'rpg-panel-tab--active' : ''"
        @click="switchCategory('all')"
      >
        全部
      </text>
      <text
        v-for="cat in categories"
        :key="cat.key"
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="activeCategory === cat.key ? 'rpg-panel-tab--active' : ''"
        @click="switchCategory(cat.key)"
      >
        {{ cat.label }}
        <text class="tab-count">{{ cat.completed }}/{{ cat.count }}</text>
      </text>
    </view>

    <scroll-view scroll-y class="rpg-loot-list-scroll">
      <view v-if="!displayedAchievements.length" class="ach-empty">
        <text class="text-xs text-tech-subtle">暂无成就</text>
      </view>
      <view v-else class="u-grid-2 u-grid-2--loose">
        <view
          v-for="ach in displayedAchievements"
          :key="ach.code"
          class="u-grid-2-item"
        >
          <view
            class="rpg-loot-card rpg-loot-card--achievement"
            :class="{ 'rpg-loot-card--locked': !ach.completed }"
          >
            <view class="rpg-loot-card-head">
              <view
                class="rpg-loot-icon"
                :class="{
                  'rpg-loot-icon--silver': shouldUseSilverRarityStyle(ach) || isSilverRarityColor(ach.rarityColor),
                  'rpg-loot-icon--tinted': !!achievementIconStyle(ach) && !shouldUseSilverRarityStyle(ach),
                }"
                :style="achievementIconStyle(ach)"
              >
                <text class="rpg-loot-icon__emoji">{{ achievementEmoji(ach) }}</text>
              </view>
              <text v-if="ach.completed" class="rpg-loot-status rpg-loot-status--done">✓ 达成</text>
            </view>
            <text class="rpg-loot-name mt-1">{{ ach.name }}</text>
            <text class="rpg-loot-desc mt-1">{{ ach.description }}</text>
            <view class="rpg-loot-progress">
              <view
                class="rpg-loot-progress__fill rpg-loot-progress__fill--exp"
                :style="{ width: `${progressPercent(ach)}%` }"
              />
            </view>
            <view class="rpg-loot-footer">
              <view class="rpg-loot-meta">
                <RpgRarityBadge
                  v-if="ach.rarityLabel"
                  :rarity="ach.rarity"
                  :rarity-label="ach.rarityLabel"
                  :rarity-color="ach.rarityColor"
                  :rarity-icon="ach.rarityIcon"
                />
                <text class="rpg-loot-progress-text">{{ ach.progress }}/{{ ach.maxProgress }}</text>
              </view>
              <view v-if="ach.expReward" class="rpg-loot-rewards mt-1">
                <text class="rpg-loot-reward-chip rpg-loot-reward-chip--exp">⭐ +{{ ach.expReward }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <text
      v-if="hiddenLockedCount > 0"
      class="ach-expand-btn"
      @click="showLocked = !showLocked"
    >
      {{ showLocked ? '收起未开始成就' : `展开未开始成就 (${hiddenLockedCount})` }}
    </text>
  </view>
</template>

<style scoped>
.ach-overview {
  margin-bottom: 12px;
}

.ach-num {
  font-size: 24px;
  font-weight: 900;
  color: #fbbf24;
}

.ach-total {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.ach-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.ach-progress-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
}

.ach-ring-text {
  font-size: 10px;
  font-weight: 700;
  color: #fbbf24;
}

.ach-tabs {
  margin-bottom: 10px;
}

.ach-empty {
  padding: 24px 12px;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.ach-expand-btn {
  display: block;
  margin-top: 8px;
  padding: 6px 10px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
</style>

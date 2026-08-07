<script lang="ts" setup>
/**
 * RPG 任务面板 — 双列战利品卡片，对齐 blog-home-nuxt QuestPanel
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import type { UserQuestProgress } from '@/types/rpg'
import { resolveQuestIconEmoji } from '@/utils/rpg-item-icon'

const props = defineProps<{
  questGroups: {
    daily: UserQuestProgress[]
    bounty: UserQuestProgress[]
    weekly: UserQuestProgress[]
    special: UserQuestProgress[]
  }
}>()

const emit = defineEmits<{
  claim: [code: string]
}>()

const { playSfx } = useRpgAudio()

type QuestTab = 'daily' | 'bounty' | 'weekly' | 'special'

const tabOptions: { key: QuestTab, label: string }[] = [
  { key: 'daily', label: '每日' },
  { key: 'bounty', label: '悬赏' },
  { key: 'weekly', label: '周常' },
  { key: 'special', label: '特殊' },
]

const activeTab = ref<QuestTab>('daily')
const claimingCode = ref<string | null>(null)
const showCompleted = ref(false)

const currentQuests = computed(() => props.questGroups[activeTab.value] || [])
const totalCompleted = computed(() => currentQuests.value.filter(q => q.completed).length)
const hasUnclaimed = computed(() => currentQuests.value.some(q => q.completed && !q.claimed))

function questRank(q: UserQuestProgress) {
  if (q.completed && !q.claimed)
    return 0
  if (!q.completed)
    return 1
  return 2
}

const sortedQuests = computed(() => {
  const quests = [...currentQuests.value].sort((a, b) => questRank(a) - questRank(b))
  if (showCompleted.value)
    return quests
  return quests.filter(q => !q.claimed)
})

const hiddenCompletedCount = computed(() => currentQuests.value.filter(q => q.claimed).length)

function switchQuestTab(key: QuestTab) {
  if (key !== activeTab.value)
    void playSfx('tabSwitch')
  activeTab.value = key
}

function questCode(q: UserQuestProgress) {
  return q.code || (q as any).questCode || ''
}

function progressPercent(q: UserQuestProgress) {
  const target = q.targetCount || (q as any).target || 1
  return Math.min(100, Math.round(((q.progress ?? 0) / target) * 100))
}

async function handleClaim(code: string) {
  claimingCode.value = code
  try {
    emit('claim', code)
  }
  finally {
    claimingCode.value = null
  }
}
</script>

<template>
  <view class="quest-panel mt-4">
    <text class="mb-2 block text-tech font-medium">任务</text>

    <view class="rpg-panel-tabs">
      <text
        v-for="opt in tabOptions"
        :key="opt.key"
        class="rpg-panel-tab"
        :class="activeTab === opt.key ? 'rpg-panel-tab--active' : ''"
        @click="switchQuestTab(opt.key)"
      >
        {{ opt.label }}
      </text>
    </view>

    <view class="quest-header u-flex-row-center flex items-center justify-between">
      <view class="u-flex-row-center">
        <text class="quest-label">{{ tabOptions.find(t => t.key === activeTab)?.label }}任务</text>
        <text class="quest-count">{{ totalCompleted }}/{{ currentQuests.length }} 完成</text>
      </view>
      <text v-if="hasUnclaimed" class="claim-badge">有奖励可领!</text>
    </view>

    <view v-if="!currentQuests.length" class="quest-empty">
      <text class="text-xs text-tech-subtle">暂无任务</text>
    </view>

    <scroll-view v-else scroll-y class="rpg-loot-list-scroll">
      <view class="u-grid-2 u-grid-2--loose">
        <view
          v-for="quest in sortedQuests"
          :key="questCode(quest)"
          class="u-grid-2-item"
        >
          <view
            class="rpg-loot-card rpg-loot-card--quest"
            :class="{
              'rpg-loot-card--done': quest.completed,
              'rpg-loot-card--claimed': quest.claimed,
              'rpg-loot-card--claimable': quest.completed && !quest.claimed,
            }"
          >
            <view class="rpg-loot-card-head">
              <view class="rpg-loot-icon rpg-loot-icon--asset">
                <text class="rpg-loot-icon__emoji">{{ resolveQuestIconEmoji(quest.targetAction) }}</text>
              </view>
              <text v-if="quest.claimed" class="rpg-loot-status rpg-loot-status--done">✓ 已领</text>
              <text v-else-if="!quest.completed" class="rpg-loot-status rpg-loot-status--pending">进行中</text>
            </view>
            <text class="rpg-loot-name mt-1">{{ quest.name || (quest as any).questName }}</text>
            <text v-if="quest.description" class="rpg-loot-desc mt-1">{{ quest.description }}</text>
            <view class="rpg-loot-progress">
              <view
                class="rpg-loot-progress__fill"
                :style="{ width: `${progressPercent(quest)}%` }"
              />
            </view>
            <view class="rpg-loot-footer">
              <view class="rpg-loot-meta">
                <text class="rpg-loot-progress-text">
                  {{ quest.progress ?? 0 }}/{{ quest.targetCount ?? (quest as any).target ?? 1 }}
                </text>
                <view class="rpg-loot-rewards">
                  <text v-if="quest.expReward" class="rpg-loot-reward-chip rpg-loot-reward-chip--exp">
                    ⭐ +{{ quest.expReward }}
                  </text>
                  <text v-if="(quest as any).hpReward" class="rpg-loot-reward-chip rpg-loot-reward-chip--hp">
                    ❤ +{{ (quest as any).hpReward }}
                  </text>
                </view>
              </view>
              <view v-if="quest.completed && !quest.claimed" class="rpg-loot-action">
                <text
                  class="rpg-loot-claim-btn"
                  @click="handleClaim(questCode(quest))"
                >
                  {{ claimingCode === questCode(quest) ? '...' : '领取奖励' }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <text
      v-if="hiddenCompletedCount > 0"
      class="quest-expand-btn"
      @click="showCompleted = !showCompleted"
    >
      {{ showCompleted ? '收起已领取' : `展开已领取 (${hiddenCompletedCount})` }}
    </text>

    <view
      v-if="totalCompleted === currentQuests.length && currentQuests.length > 0 && activeTab === 'daily'"
      class="quest-all-done"
    >
      <text>🎉 今日任务已全部完成！</text>
    </view>
  </view>
</template>

<style scoped>
.quest-header {
  margin-bottom: 10px;
}

.quest-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 8px;
}

.quest-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}

.claim-badge {
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(251, 191, 36, 0.12);
}

.quest-empty {
  padding: 24px 12px;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.quest-expand-btn {
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

.quest-all-done {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #4ade80;
  padding: 8px;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.1);
}
</style>

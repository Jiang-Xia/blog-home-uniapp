<script lang="ts" setup>
/**
 * RPG 排行榜面板（对齐 blog-home-nuxt LeaderboardPanel）
 * 五维度 × 四周期；头像/昵称跳转 ROUTE_USER_PUBLIC
 */
import { ROUTE_USER_PUBLIC } from '@/router/routes'
import type { LeaderboardPeriod, LeaderboardScoreType } from '@/types/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import {
  formatLeaderboardScore,
  getLeaderboardRankClass,
  RPG_LEADERBOARD_PERIOD_TABS,
  RPG_LEADERBOARD_TYPE_TABS,
} from '@/utils/rpg-display'
import { resolveStaticUrl } from '@/utils/static-url'

defineProps<{
  leaderboard: any[]
  loading: boolean
}>()

const activeType = defineModel<LeaderboardScoreType>('activeType', { default: 'exp' })
const activePeriod = defineModel<LeaderboardPeriod>('activePeriod', { default: 'total' })

const { playSfx } = useRpgAudio()

const periodOptions = RPG_LEADERBOARD_PERIOD_TABS
const typeOptions = RPG_LEADERBOARD_TYPE_TABS

/** 切换排行榜周期 Tab */
function switchPeriod(key: LeaderboardPeriod) {
  if (key !== activePeriod.value)
    void playSfx('tabSwitch')
  activePeriod.value = key
}

/** 切换排行榜维度 Tab */
function switchType(key: LeaderboardScoreType) {
  if (key !== activeType.value)
    void playSfx('tabSwitch')
  activeType.value = key
}

/** 跳转用户公开主页 */
function goUserPublic(uid: number) {
  if (!uid)
    return
  uni.navigateTo({ url: `${ROUTE_USER_PUBLIC}?uid=${uid}` })
}

function rankDisplay(rank: number) {
  if (rank === 1)
    return '🥇'
  if (rank === 2)
    return '🥈'
  if (rank === 3)
    return '🥉'
  return String(rank)
}
</script>

<template>
  <view class="leaderboard-panel">
    <view class="u-gap-2 mb-2 flex flex-wrap">
      <view v-for="opt in periodOptions" :key="opt.key">
        <text
          class="leaderboard-panel__tab"
          :class="activePeriod === opt.key ? 'leaderboard-panel__tab--active' : ''"
          @click="switchPeriod(opt.key)"
        >
          {{ opt.label }}
        </text>
      </view>
    </view>
    <view class="u-gap-2 mb-3 flex flex-wrap">
      <view v-for="opt in typeOptions" :key="opt.key">
        <text
          class="leaderboard-panel__tab"
          :class="activeType === opt.key ? 'leaderboard-panel__tab--active' : ''"
          @click="switchType(opt.key)"
        >
          {{ opt.icon }} {{ opt.label }}
        </text>
      </view>
    </view>

    <view v-if="loading" class="leaderboard-panel__loading">
      <text class="text-sm text-tech-subtle">加载中…</text>
    </view>
    <view v-else-if="leaderboard.length === 0" class="leaderboard-panel__empty">
      <text class="text-sm text-tech-subtle">暂无排行数据</text>
    </view>
    <view v-else class="leaderboard-list">
      <view
        v-for="entry in leaderboard"
        :key="entry.uid"
        class="rank-row"
        :class="[
          entry.rank <= 3 ? 'rank-row--top' : '',
          getLeaderboardRankClass(entry.rank),
        ]"
      >
        <view class="u-gap-2 u-flex-row-center">
          <text class="rank-row__num">{{ rankDisplay(entry.rank) }}</text>
          <view class="rank-row__avatar" @click="goUserPublic(entry.uid)">
            <image
              v-if="entry.avatar"
              :src="resolveStaticUrl(entry.avatar)"
              class="rank-row__avatar-img"
              mode="aspectFill"
            />
            <text v-else class="rank-row__avatar-fallback">
              {{ entry.nickname?.charAt(0) || '?' }}
            </text>
          </view>
          <view class="min-w-0 flex-1" @click="goUserPublic(entry.uid)">
            <text class="rank-row__name block text-tech font-medium">{{ entry.nickname }}</text>
            <text class="text-xs text-tech-muted">LV{{ entry.level }}</text>
          </view>
          <text class="rank-row__score shrink-0 text-sm">
            {{ formatLeaderboardScore(entry, activeType) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.leaderboard-panel__tab {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-panel__tab--active {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.45);
  background: rgba(251, 191, 36, 0.1);
}

.leaderboard-panel__loading,
.leaderboard-panel__empty {
  padding: 24px 0;
  text-align: center;
}

.leaderboard-list .rank-row {
  margin-bottom: 16rpx;
}

.leaderboard-list .rank-row:last-child {
  margin-bottom: 0;
}

.rank-row {
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.rank-row__num {
  min-width: 24px;
  text-align: center;
  font-weight: 800;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.rank-row__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.rank-row__avatar-img {
  width: 100%;
  height: 100%;
}

.rank-row__avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 700;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.rank-row__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.rank-row__score {
  font-weight: 700;
  font-size: 12px;
  color: #fbbf24;
  white-space: nowrap;
}

.rank-row--top {
  border-color: rgba(251, 191, 36, 0.35);
}

.rpg-rank--gold {
  border-color: rgba(251, 191, 36, 0.5);
}

.rpg-rank--silver {
  border-color: rgba(200, 212, 224, 0.45);
}

.rpg-rank--bronze {
  border-color: rgba(205, 127, 50, 0.45);
}
</style>

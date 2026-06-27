/**
 * RPG 排行榜维度/周期 Tab 文案（对齐 blog-home-nuxt LeaderboardPanel）
 */
import type { LeaderboardPeriod, LeaderboardScoreType } from '@/types/rpg'

export const RPG_LEADERBOARD_TYPE_TABS: { key: LeaderboardScoreType, label: string, icon: string }[] = [
  { key: 'exp', label: '经验', icon: '✨' },
  { key: 'reputation', label: '声望', icon: '🏅' },
  { key: 'currency', label: '钻石', icon: '💎' },
  { key: 'level', label: '等级', icon: '⚔️' },
  { key: 'signDays', label: '签到', icon: '📅' },
]

export const RPG_LEADERBOARD_PERIOD_TABS: { key: LeaderboardPeriod, label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'season', label: '赛季榜' },
  { key: 'week', label: '周榜' },
  { key: 'month', label: '月榜' },
]

export type RpgLeaderboardScoreType = LeaderboardScoreType

export function formatLeaderboardScore(row: Record<string, unknown>, type: LeaderboardScoreType): string {
  if (row.score !== undefined && row.score !== null)
    return String(row.score)
  switch (type) {
    case 'exp':
      return `${row.exp ?? 0} 经验`
    case 'reputation':
      return `${row.reputation ?? 0} 声望`
    case 'currency':
      return `${row.currency ?? 0} 钻石`
    case 'signDays':
      return `${row.totalSignDays ?? 0} 天`
    case 'level':
      return `LV${row.level ?? 1}`
    default:
      return ''
  }
}

export function rpgItemDisplayName(item: {
  itemCode?: string
  name?: string
  config?: { name?: string }
}): string {
  return item.config?.name || item.name || item.itemCode || '—'
}

export function getLeaderboardRankClass(rank: number): string {
  if (rank === 1)
    return 'rpg-rank--gold'
  if (rank === 2)
    return 'rpg-rank--silver'
  if (rank === 3)
    return 'rpg-rank--bronze'
  return ''
}

/**
 * RPG 排行榜维度 Tab 文案（对齐 blog-home-nuxt LeaderboardPanel，非物品配置表）
 */
export const RPG_LEADERBOARD_TYPE_TABS = [
  { key: 'exp', label: '经验' },
  { key: 'reputation', label: '声望' },
  { key: 'currency', label: '钻石' },
  { key: 'level', label: '等级' },
] as const

export type RpgLeaderboardScoreType = typeof RPG_LEADERBOARD_TYPE_TABS[number]['key']

/** 排行榜行分数展示文案 */
export function formatLeaderboardScore(row: Record<string, unknown>, type: RpgLeaderboardScoreType): string {
  if (row.score !== undefined && row.score !== null)
    return String(row.score)
  switch (type) {
    case 'exp':
      return `${row.exp ?? 0} 经验`
    case 'reputation':
      return `${row.reputation ?? 0} 声望`
    case 'currency':
      return `${row.currency ?? 0} 钻石`
    case 'level':
      return `LV${row.level ?? 1}`
    default:
      return ''
  }
}

/** 背包物品展示名（config.name 由后端 enrich） */
export function rpgItemDisplayName(item: {
  itemCode?: string
  name?: string
  config?: { name?: string }
}): string {
  return item.config?.name || item.name || item.itemCode || '—'
}

import type { CurrentActivitiesOverview, RpgActivitySummary } from '@/types/rpg'

/**
 * 解析 /rpg/activities/current 响应为 C 端概览结构
 * - Nest / 对齐后的 Go：{ season, limitedTime, effectiveExpBuffRate }
 * - 旧 Go：{ activities: [...] }
 */
export function parseCurrentActivitiesOverview(raw: unknown): CurrentActivitiesOverview | null {
  if (!raw || typeof raw !== 'object')
    return null

  const data = raw as Record<string, unknown>

  if ('season' in data || 'limitedTime' in data) {
    const limitedTime = Array.isArray(data.limitedTime)
      ? data.limitedTime as RpgActivitySummary[]
      : []
    const season = (data.season as RpgActivitySummary | null) ?? null
    if (!season && limitedTime.length === 0)
      return null
    return {
      season,
      limitedTime,
      effectiveExpBuffRate: typeof data.effectiveExpBuffRate === 'number'
        ? Math.round(data.effectiveExpBuffRate * 10000) / 10000
        : 1,
    }
  }

  if (Array.isArray(data.activities)) {
    const activities = data.activities as RpgActivitySummary[]
    if (activities.length === 0)
      return null
    const season = activities.find(a => a.activityType === 'season') ?? null
    const limitedTime = activities.filter(a => a.activityType !== 'season')
    const effectiveExpBuffRate = Math.max(1, ...activities.map(a => a.expBuffRate || 1))
    if (!season && limitedTime.length === 0)
      return null
    return { season, limitedTime, effectiveExpBuffRate }
  }

  return null
}

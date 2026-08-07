/** 经验活动倍率展示（避免浮点长尾如 1.20000000476837158） */
export function formatExpBuffRate(rate?: number | null): string {
  if (rate == null || rate <= 0)
    return '1'
  const rounded = Math.round(rate * 10000) / 10000
  return String(Number.parseFloat(rounded.toFixed(4)))
}

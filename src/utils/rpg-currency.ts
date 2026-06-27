export const CURRENCY_GAIN_FX_THRESHOLD = 50

export function formatRpgCurrencyReasonLabel(reason?: string, reasonLabel?: string): string {
  const raw = (reasonLabel || reason || '').trim()
  if (!raw)
    return '钻石奖励'
  if (raw.startsWith('支付补钻') || raw.includes('支付补钻'))
    return '充值'
  if (raw === 'admin_recharge' || raw === '管理员充值')
    return '充值'
  if (raw === 'recharge' || raw === '充值')
    return '充值'
  return raw
}

export function shouldShowCurrencyGainFx(delta: number): boolean {
  return delta >= CURRENCY_GAIN_FX_THRESHOLD
}

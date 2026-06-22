import { http } from '@/http/http'
import { afterRpgMutation } from '@/api/rpg-inflight'

export interface RpgRechargeCreateResult {
  outTradeNo: string
  amountYuan: number
  diamonds: number
  rateText: string
  scheme: string
  universalLink: string
}

export interface RpgRechargeStatusResult {
  outTradeNo: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CLOSED' | 'FAILED'
  amountYuan: number
  diamonds: number
  fulfilled: boolean
  balance?: number
  tradeNo?: string
}

export function createRpgRechargeOrder(amountYuan: number) {
  return http.post<RpgRechargeCreateResult>('/rpg/recharge/create', { amountYuan })
}

export function getRpgRechargeStatus(outTradeNo: string) {
  return afterRpgMutation(['status'], () =>
    http.get<RpgRechargeStatusResult>('/rpg/recharge/status', { out_trade_no: outTradeNo }))
}

/** 微信小程序支付 POST /pay/trade/create */
export function createWxPayOrder(data: Record<string, unknown>) {
  return http.post<any>('/pay/trade/create', data)
}

/**
 * 全站 RPG 实时事件处理（Toast + 庆祝动画状态 + 增量刷新）
 */
import { ref } from 'vue'
import {
  connectRealtimeSocket,
  disconnectRealtimeSocket,
  notifyDataRefresh,
  onDataRefresh,
  onRealtimeEvent,
} from '@/composables/use-realtime-socket'
import type { RpgRefreshScope } from '@/composables/use-realtime-socket'
import { useRpg } from '@/composables/use-rpg'
import { useRpgLotterySession } from '@/composables/use-rpg-lottery-session'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import {
  EXP_REASON_LABEL,
  formatGuildEventMessage,
  LEADERBOARD_PERIOD_LABEL,
  LEADERBOARD_TYPE_LABEL,
} from '@/constants/rpg-ws-display'
import { itemGrantedSfxKey } from '@/constants/rpg-audio'
import type { LevelUpResult, RpgSocialFeedbackData } from '@/types/rpg'
import { shouldShowCurrencyGainFx } from '@/utils/rpg-currency'
import { shouldShowItemRevealCelebration } from '@/utils/rpg-rarity'

const refreshCallbacks = new Map<RpgRefreshScope, Set<() => void>>()

export function registerRpgRefresh(scope: RpgRefreshScope, fn: () => void) {
  if (!refreshCallbacks.has(scope))
    refreshCallbacks.set(scope, new Set())
  refreshCallbacks.get(scope)!.add(fn)
  return () => refreshCallbacks.get(scope)?.delete(fn)
}

function triggerScope(scope: RpgRefreshScope) {
  refreshCallbacks.get(scope)?.forEach(fn => fn())
}

export type RpgScreenPulseKind = 'lifeDeduct' | 'lifeRecover' | 'shield' | 'buffGrant' | 'buffExpire'

/** 全屏动画状态（由 rpg-global-init 挂载组件消费） */
export const rpgAnimationState = {
  levelUpVisible: ref(false),
  levelUpData: ref<LevelUpResult | null>(null),
  achievementVisible: ref(false),
  achievementName: ref(''),
  achievementExpReward: ref(0),
  achievementRarityColor: ref(''),
  achievementRarityLabel: ref(''),
  questRewardVisible: ref(false),
  questRewardName: ref(''),
  questRewardExp: ref(0),
  questCompleteVisible: ref(false),
  questCompleteName: ref(''),
  petHatchVisible: ref(false),
  petHatchName: ref(''),
  itemRevealVisible: ref(false),
  itemRevealName: ref(''),
  itemRevealRarityLabel: ref(''),
  rankChangeVisible: ref(false),
  rankChangeRank: ref(0),
  rankChangeTypeLabel: ref(''),
  rankChangePeriodLabel: ref(''),
  socialFeedbackVisible: ref(false),
  socialFeedbackData: ref<RpgSocialFeedbackData | null>(null),
  screenPulseVisible: ref(false),
  screenPulseKind: ref<RpgScreenPulseKind | null>(null),
  screenPulseLabel: ref(''),
  currencyGainVisible: ref(false),
  currencyGainAmount: ref(0),
  currencyGainReason: ref(''),
  activityBannerVisible: ref(false),
  activityBannerName: ref(''),
  banPunishVisible: ref(false),
}

export function useRpgRealtimeHandlers() {
  const { rpgStatus, fetchStatus, fetchQuests, fetchBanStatus, fetchBuffs } = useRpg()
  const { deferCelebration } = useRpgLotterySession()
  const { playSfx } = useRpgAudio()
  const s = rpgAnimationState

  const refreshOn = (scopes: RpgRefreshScope[], event: Parameters<typeof onRealtimeEvent>[0]) => {
    onRealtimeEvent(event, () => {
      scopes.forEach(scope => notifyDataRefresh(scope))
    })
  }

  refreshOn(['status'], 'levelUp')
  refreshOn(['status'], 'lifeChange')
  refreshOn(['status'], 'currencyChange')
  refreshOn(['status', 'quests'], 'questComplete')
  refreshOn(['status', 'quests'], 'questReward')
  refreshOn(['status', 'achievements'], 'achievementComplete')
  refreshOn(['inventory', 'status'], 'itemGranted')
  refreshOn(['pets'], 'petHatched')
  refreshOn(['guild'], 'guildEvent')
  refreshOn(['leaderboard'], 'rankChange')
  refreshOn(['status'], 'rechargeComplete')
  refreshOn(['buffs'], 'buffGranted')
  refreshOn(['buffs'], 'buffExpired')

  onRealtimeEvent('levelUp', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      s.levelUpData.value = data as LevelUpResult
      s.levelUpVisible.value = true
      playSfx('levelUp')
    })
  })

  onRealtimeEvent('achievementComplete', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      s.achievementName.value = data.name || data.achievementName || '新成就'
      s.achievementExpReward.value = data.expReward ?? 0
      s.achievementRarityColor.value = data.rarityColor || ''
      s.achievementRarityLabel.value = data.rarityLabel || ''
      s.achievementVisible.value = true
      playSfx('achievement')
    })
  })

  onRealtimeEvent('questReward', (data: any) => {
    void fetchQuests()
    deferCelebration(() => {
      s.questRewardName.value = data.questName || '任务'
      s.questRewardExp.value = data.expReward ?? 0
      s.questRewardVisible.value = true
      playSfx('questReward')
      uni.showToast({ title: `任务奖励 +${data.expReward ?? 0} EXP`, icon: 'success' })
    })
  })

  onRealtimeEvent('questComplete', (data: any) => {
    void fetchQuests()
    deferCelebration(() => {
      s.questCompleteName.value = data.questName || '任务'
      s.questCompleteVisible.value = true
      playSfx('questComplete')
    })
  })

  onRealtimeEvent('petHatched', (data: any) => {
    deferCelebration(() => {
      s.petHatchName.value = data.petName || data.nickname || '新宠物'
      s.petHatchVisible.value = true
      playSfx('petHatch')
    })
  })

  onRealtimeEvent('itemGranted', (data: any) => {
    if (shouldShowItemRevealCelebration(data.rarityLabel)) {
      deferCelebration(() => {
        s.itemRevealName.value = data.itemName || data.name || '稀有物品'
        s.itemRevealRarityLabel.value = data.rarityLabel || ''
        s.itemRevealVisible.value = true
        playSfx(itemGrantedSfxKey(data.rarityLabel) as any)
      })
    }
  })

  onRealtimeEvent('rankChange', (data: any) => {
    deferCelebration(() => {
      s.rankChangeRank.value = data.rank ?? 0
      s.rankChangeTypeLabel.value = LEADERBOARD_TYPE_LABEL[data.type] || data.type || ''
      s.rankChangePeriodLabel.value = LEADERBOARD_PERIOD_LABEL[data.period] || data.period || ''
      s.rankChangeVisible.value = true
      playSfx('rankUp')
    })
  })

  onRealtimeEvent('socialReceived', (data: any) => {
    deferCelebration(() => {
      s.socialFeedbackData.value = {
        kind: data.action,
        fromNickname: data.fromNickname || '冒险者',
        hpDelta: data.hpDelta,
        reputationDelta: data.reputationDelta,
      }
      s.socialFeedbackVisible.value = true
    })
  })

  onRealtimeEvent('tipReceived', (data: any) => {
    deferCelebration(() => {
      s.socialFeedbackData.value = {
        kind: 'tip',
        fromNickname: data.fromNickname || '读者',
        amount: data.amount,
        articleTitle: data.articleTitle,
      }
      s.socialFeedbackVisible.value = true
      playSfx('socialTip')
    })
  })

  onRealtimeEvent('currencyChange', (data: any) => {
    void fetchStatus()
    if (shouldShowCurrencyGainFx(data.delta ?? 0)) {
      deferCelebration(() => {
        s.currencyGainAmount.value = data.delta
        s.currencyGainReason.value = data.reasonLabel || data.reason || '钻石奖励'
        s.currencyGainVisible.value = true
        playSfx('currencyGain')
      })
    }
  })

  onRealtimeEvent('lifeChange', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      s.screenPulseKind.value = data.lifeRecovered > 0 ? 'lifeRecover' : 'lifeDeduct'
      s.screenPulseLabel.value = data.lifeRecovered > 0 ? `+${data.lifeRecovered} HP` : `-${data.lifeDeducted} HP`
      s.screenPulseVisible.value = true
    })
  })

  onRealtimeEvent('banStatus', (data: any) => {
    void fetchBanStatus()
    if (data.banned) {
      deferCelebration(() => {
        s.banPunishVisible.value = true
        playSfx('banPunish')
      })
    }
  })

  onRealtimeEvent('activityUpdate', (data: any) => {
    if (data.event === 'start') {
      deferCelebration(() => {
        s.activityBannerName.value = data.activityName || data.name || '新活动'
        s.activityBannerVisible.value = true
      })
    }
  })

  onRealtimeEvent('guildEvent', (data: any) => {
    const msg = formatGuildEventMessage(data.type, data.nickname || '', data.guildName || '')
    uni.showToast({ title: msg, icon: 'none' })
  })

  onRealtimeEvent('expGain', (data: any) => {
    void fetchStatus()
    const labels = (data.reasonLabels || []).map((r: string) => EXP_REASON_LABEL[r] || r).join('、')
    if (data.amount > 0)
      uni.showToast({ title: `+${data.amount} EXP${labels ? `（${labels}）` : ''}`, icon: 'none' })
  })

  onRealtimeEvent('rechargeComplete', (data: any) => {
    void fetchStatus()
    uni.showToast({ title: `充值成功 +${data?.diamonds ?? 0} 钻`, icon: 'success' })
  })

  onRealtimeEvent('buffGranted', (data: any) => {
    void fetchBuffs()
    uni.showToast({ title: `获得增益：${data.name}`, icon: 'none' })
  })

  onDataRefresh((scope) => {
    triggerScope(scope)
  })
}

/** 冒险页内 WS 初始化（仅注册 refresh，socket 由 GlobalInit 连接） */
export function initRpgRealtimeHandlers() {
  return () => {}
}

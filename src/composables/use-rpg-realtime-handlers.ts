/**
 * 全站 RPG 实时事件处理（Toast + 庆祝动画状态 + 增量刷新）
 * 对齐 blog-home-nuxt composables/use-rpg-realtime-handlers.ts
 */
import { nextTick, ref } from 'vue'
import type { ItemRevealData } from '@/components/rpg/rpg-item-reveal-animation.vue'
import type { ArticleLevelUpData } from '@/components/rpg/rpg-article-level-up-badge.vue'
import {
  notifyDataRefresh,
  onDataRefresh,
  onRealtimeEvent,
} from '@/composables/use-realtime-socket'
import type { RpgRefreshScope } from '@/composables/use-realtime-socket'
import { useRpg } from '@/composables/use-rpg'
import { useRpgLotterySession } from '@/composables/use-rpg-lottery-session'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import {
  formatGuildEventMessage,
  LEADERBOARD_PERIOD_LABEL,
  LEADERBOARD_TYPE_LABEL,
  SOCIAL_ACTION_LABEL,
} from '@/constants/rpg-ws-display'
import { itemGrantedSfxKey } from '@/constants/rpg-audio'
import type { LevelUpResult, RpgSocialFeedbackData } from '@/types/rpg'
import { formatRpgCurrencyReasonLabel, shouldShowCurrencyGainFx } from '@/utils/rpg-currency'
import { shouldShowItemRevealCelebration } from '@/utils/rpg-rarity'

const EXP_TOAST_DEBOUNCE_MS = 5000

const refreshCallbacks = new Map<RpgRefreshScope, Set<() => void>>()

let expToastTimer: ReturnType<typeof setTimeout> | null = null
let pendingExpAmount = 0
let pendingExpLabels: string[] = []

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
  achievementRarityIcon: ref(''),
  masterpieceVisible: ref(false),
  masterpieceTitle: ref(''),
  articleLevelUpVisible: ref(false),
  articleLevelUpData: ref<ArticleLevelUpData | null>(null),
  questRewardVisible: ref(false),
  questRewardName: ref(''),
  questRewardExp: ref(0),
  questCompleteVisible: ref(false),
  questCompleteName: ref(''),
  petHatchVisible: ref(false),
  petHatchName: ref(''),
  itemRevealVisible: ref(false),
  itemRevealData: ref<ItemRevealData | null>(null),
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
  activityBannerSubtitle: ref(''),
  banPunishVisible: ref(false),
}

function flushExpToast() {
  if (pendingExpAmount <= 0)
    return
  const labels = [...new Set(pendingExpLabels)].join('、') || '活动'
  uni.showToast({
    title: `+${pendingExpAmount} EXP（${labels}）`,
    icon: 'none',
  })
  pendingExpAmount = 0
  pendingExpLabels = []
  expToastTimer = null
}

function scheduleExpToast(amount: number, reasonLabels: string[]) {
  pendingExpAmount += amount
  pendingExpLabels.push(...reasonLabels)
  if (expToastTimer)
    clearTimeout(expToastTimer)
  expToastTimer = setTimeout(flushExpToast, EXP_TOAST_DEBOUNCE_MS)
}

function triggerScreenPulse(kind: RpgScreenPulseKind, label = '') {
  const s = rpgAnimationState
  s.screenPulseVisible.value = false
  nextTick(() => {
    s.screenPulseKind.value = kind
    s.screenPulseLabel.value = label
    s.screenPulseVisible.value = true
  })
}

function triggerCurrencyGainFx(amount: number, reason: string) {
  const s = rpgAnimationState
  s.currencyGainVisible.value = false
  nextTick(() => {
    s.currencyGainAmount.value = amount
    s.currencyGainReason.value = reason
    s.currencyGainVisible.value = true
  })
}

function showSocialFeedback(feedback: RpgSocialFeedbackData) {
  const s = rpgAnimationState
  s.socialFeedbackData.value = feedback
  s.socialFeedbackVisible.value = true
}

export function useRpgRealtimeHandlers() {
  const { rpgStatus, banStatus, fetchStatus, fetchQuests, fetchBanStatus, fetchBuffs } = useRpg()
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
  refreshOn(['status', 'inventory'], 'rechargeComplete')
  refreshOn(['buffs'], 'buffGranted')
  refreshOn(['buffs'], 'buffExpired')
  refreshOn(['buffs'], 'shieldUsed')
  refreshOn(['status'], 'lotteryTicketChange')
  refreshOn(['status'], 'weatherBuff')
  refreshOn(['status'], 'activityUpdate')

  onRealtimeEvent('levelUp', (data: any) => {
    const payload = data as LevelUpResult
    if (rpgStatus.value)
      rpgStatus.value.level = payload.newLevel
    void fetchStatus()
    deferCelebration(() => {
      s.levelUpData.value = payload
      s.levelUpVisible.value = true
      playSfx('levelUp')
    })
  })

  onRealtimeEvent('lifeChange', (data: any) => {
    if (rpgStatus.value)
      rpgStatus.value.lifeValue = data.currentLife
    void fetchStatus()
    deferCelebration(() => {
      if (data.lifeRecovered && data.lifeRecovered > 0) {
        triggerScreenPulse('lifeRecover')
        uni.showToast({
          title: `生命值 +${data.lifeRecovered}（当前 ${data.currentLife}）`,
          icon: 'none',
        })
      }
      else if (data.lifeDeducted > 0) {
        triggerScreenPulse('lifeDeduct')
        uni.showToast({
          title: `命中敏感词，生命值 -${data.lifeDeducted}（剩余 ${data.currentLife}）`,
          icon: 'none',
        })
      }
    })
  })

  onRealtimeEvent('banStatus', (data: any) => {
    if (banStatus.value) {
      banStatus.value.banned = data.banned
      banStatus.value.banEndTime = data.banEndTime
    }
    void fetchBanStatus()
    deferCelebration(() => {
      if (data.banned) {
        const reason = data.banReason ? `：${data.banReason}` : ''
        uni.showToast({ title: `您已被禁言${reason}`, icon: 'none' })
        s.banPunishVisible.value = true
        playSfx('banPunish')
      }
    })
  })

  onRealtimeEvent('achievementComplete', (data: any) => {
    void Promise.all([fetchQuests(), fetchStatus()])
    deferCelebration(() => {
      s.achievementName.value = data.name || data.achievementName || '新成就'
      s.achievementExpReward.value = data.expReward ?? 0
      s.achievementRarityColor.value = data.rarityColor || ''
      s.achievementRarityLabel.value = data.rarityLabel || ''
      s.achievementRarityIcon.value = data.rarityIcon || ''
      s.achievementVisible.value = true
      playSfx('achievement')
    })
  })

  onRealtimeEvent('questReward', (data: any) => {
    void Promise.all([fetchQuests(), fetchStatus()])
    deferCelebration(() => {
      const label = data.questName ? `「${data.questName}」` : '任务'
      const exp = data.expReward ?? 0
      uni.showToast({ title: `${label} 奖励已发放${exp ? ` +${exp} EXP` : ''}`, icon: 'none' })
      s.questRewardName.value = data.questName || '任务'
      s.questRewardExp.value = exp
      s.questRewardVisible.value = true
      playSfx('questReward')
    })
  })

  onRealtimeEvent('buffGranted', (data: any) => {
    void fetchBuffs()
    deferCelebration(() => {
      uni.showToast({ title: `获得增益：${data.name}`, icon: 'none' })
      triggerScreenPulse('buffGrant', data.name)
    })
  })

  onRealtimeEvent('questComplete', (data: any) => {
    void fetchQuests()
    deferCelebration(() => {
      const label = data.questName ? `「${data.questName}」` : '任务'
      uni.showToast({ title: `${label} 已完成，去领取奖励吧！`, icon: 'none' })
      s.questCompleteName.value = data.questName || '任务'
      s.questCompleteVisible.value = true
      playSfx('questComplete')
    })
  })

  onRealtimeEvent('expGain', (data: any) => {
    void fetchStatus()
    if (data.amount > 0) {
      deferCelebration(() => {
        scheduleExpToast(data.amount, data.reasonLabels || [])
      })
    }
  })

  onRealtimeEvent('socialReceived', (data: any) => {
    if (rpgStatus.value)
      rpgStatus.value.lifeValue = data.currentLife
    void fetchStatus()
    deferCelebration(() => {
      const actionLabel = SOCIAL_ACTION_LABEL[data.action] || data.action
      const from = data.fromNickname || '冒险者'
      if (data.action === 'cheer') {
        uni.showToast({ title: `${from} 给你加油了！HP +${data.hpDelta}`, icon: 'none' })
        showSocialFeedback({ kind: 'cheer', fromNickname: from, hpDelta: data.hpDelta })
        playSfx('socialCheer')
      }
      else if (data.action === 'egg') {
        uni.showToast({ title: `${from} 向你扔了鸡蛋！HP ${data.hpDelta}`, icon: 'none' })
        showSocialFeedback({ kind: 'egg', fromNickname: from, hpDelta: data.hpDelta })
        playSfx('socialEgg')
      }
      else if (data.action === 'flower') {
        uni.showToast({ title: `${from} 向你送了鲜花！声望 +${data.reputationDelta}`, icon: 'none' })
        showSocialFeedback({ kind: 'flower', fromNickname: from, reputationDelta: data.reputationDelta })
        playSfx('socialFlower')
      }
      else {
        uni.showToast({ title: `${from} 对你进行了${actionLabel}`, icon: 'none' })
      }
    })
  })

  onRealtimeEvent('tipReceived', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      const from = data.fromNickname || '冒险者'
      uni.showToast({
        title: `收到打赏 +${data.amount} 钻石《${data.articleTitle}》`,
        icon: 'success',
      })
      showSocialFeedback({
        kind: 'tip',
        fromNickname: from,
        amount: data.amount,
        articleTitle: data.articleTitle,
      })
      playSfx('socialTip')
    })
  })

  onRealtimeEvent('articleLevelUp', (data: any) => {
    deferCelebration(() => {
      uni.showToast({
        title: `文章《${data.articleTitle}》升级至 Lv${data.newLevel}`,
        icon: 'none',
      })
      s.articleLevelUpData.value = {
        articleId: data.articleId,
        articleTitle: data.articleTitle,
        oldLevel: data.oldLevel,
        newLevel: data.newLevel,
      }
      s.articleLevelUpVisible.value = true
    })
  })

  onRealtimeEvent('masterpiece', (data: any) => {
    deferCelebration(() => {
      s.masterpieceTitle.value = data.articleTitle || '你的文章'
      s.masterpieceVisible.value = true
      uni.showToast({
        title: `文章《${data.articleTitle}》晋升神作！`,
        icon: 'none',
      })
    })
  })

  onRealtimeEvent('rechargeComplete', () => {
    void fetchStatus()
  })

  onRealtimeEvent('currencyChange', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      const label = formatRpgCurrencyReasonLabel(data.reason, data.reasonLabel)
      if (data.delta > 0) {
        uni.showToast({
          title: `+${data.delta} 钻石（${label}），余额 ${data.balance}`,
          icon: 'none',
        })
        if (shouldShowCurrencyGainFx(data.delta)) {
          triggerCurrencyGainFx(data.delta, label)
          playSfx('currencyGain')
        }
      }
      else if (data.delta < 0) {
        uni.showToast({
          title: `${data.delta} 钻石（${label}），余额 ${data.balance}`,
          icon: 'none',
        })
      }
    })
  })

  onRealtimeEvent('itemGranted', (data: any) => {
    deferCelebration(() => {
      const name = data.config?.name || data.itemName || data.itemCode || '物品'
      const rarityLabel = data.config?.rarityLabel || data.rarityLabel
      const rarity = rarityLabel ? ` [${rarityLabel}]` : ''
      uni.showToast({ title: `获得 ${name}${rarity} x${data.quantity ?? 1}`, icon: 'none' })
      const showReveal = data.source !== 'lottery' && shouldShowItemRevealCelebration(rarityLabel)
      if (showReveal) {
        s.itemRevealData.value = {
          name,
          rarityLabel,
          rarityColor: data.config?.rarityColor || data.rarityColor,
          quantity: data.quantity,
          sourceLabel: data.sourceLabel,
        }
        s.itemRevealVisible.value = true
      }
      else if (data.source !== 'lottery') {
        playSfx(itemGrantedSfxKey(rarityLabel))
      }
    })
  })

  onRealtimeEvent('lotteryTicketChange', (data: any) => {
    void fetchStatus()
    deferCelebration(() => {
      const sign = data.delta > 0 ? '+' : ''
      uni.showToast({
        title: `抽奖券 ${sign}${data.delta}（${data.reasonLabel || data.reason}），当前 ${data.total} 张`,
        icon: 'none',
      })
    })
  })

  onRealtimeEvent('petHatched', (data: any) => {
    deferCelebration(() => {
      uni.showToast({
        title: `孵化成功：${data.name} [${data.rarityLabel}]`,
        icon: 'none',
      })
      s.petHatchName.value = data.name || '新宠物'
      s.petHatchVisible.value = true
      playSfx('petHatch')
    })
  })

  onRealtimeEvent('shieldUsed', (data: any) => {
    void fetchBuffs()
    deferCelebration(() => {
      triggerScreenPulse('shield', data.buffName || '护盾')
      uni.showToast({
        title: `${data.buffName || '护盾'}已抵消敏感词扣血`,
        icon: 'none',
      })
    })
  })

  onRealtimeEvent('weatherBuff', (data: any) => {
    deferCelebration(() => {
      uni.showToast({ title: `今日天气：${data.label}`, icon: 'none' })
    })
  })

  onRealtimeEvent('activityUpdate', (data: any) => {
    deferCelebration(() => {
      const activities = data.activities || []
      const names = activities.map((a: any) => a.name).join('、')
      if (data.type === 'start') {
        uni.showToast({ title: `活动开始：${names}`, icon: 'none' })
        if (activities.length) {
          s.activityBannerName.value = names
          const buff = activities[0]?.expBuffRate
          s.activityBannerSubtitle.value = buff ? `经验 +${Math.round(buff * 100)}%` : ''
          s.activityBannerVisible.value = true
        }
      }
      else if (data.type === 'end') {
        uni.showToast({ title: `活动结束：${names}`, icon: 'none' })
      }
      else if (activities.length) {
        uni.showToast({ title: `进行中活动：${names}`, icon: 'none' })
      }
    })
  })

  onRealtimeEvent('rankChange', (data: any) => {
    deferCelebration(() => {
      const periodLabel = LEADERBOARD_PERIOD_LABEL[data.period] || data.period
      uni.showToast({ title: `${periodLabel}第 ${data.rank} 名！`, icon: 'none' })
      s.rankChangeRank.value = data.rank ?? 0
      s.rankChangeTypeLabel.value = LEADERBOARD_TYPE_LABEL[data.type] || data.type || ''
      s.rankChangePeriodLabel.value = periodLabel
      s.rankChangeVisible.value = true
      playSfx('rankUp')
    })
  })

  onRealtimeEvent('guildEvent', (data: any) => {
    deferCelebration(() => {
      uni.showToast({
        title: formatGuildEventMessage(data.type, data.nickname || '', data.guildName || ''),
        icon: 'none',
      })
    })
  })

  onRealtimeEvent('buffExpired', (data: any) => {
    void fetchBuffs()
    deferCelebration(() => {
      uni.showToast({ title: `增益「${data.name}」已过期`, icon: 'none' })
      triggerScreenPulse('buffExpire', data.name)
    })
  })

  onDataRefresh((scope) => {
    triggerScope(scope)
  })
}

/** 冒险页内 WS 初始化（仅注册 refresh，socket 由 GlobalInit 连接） */
export function initRpgRealtimeHandlers() {
  return () => {}
}

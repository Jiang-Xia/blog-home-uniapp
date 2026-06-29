/**
 * RPG WebSocket 本地测试挡板（对齐 blog-home-nuxt utils/rpg-dev-mock.ts）
 * - dev 全站；生产仅 pages-tool/test
 */
import {
  dispatchLocalEvent,

} from '@/composables/use-realtime-socket'
import type { RealtimeSocketEvent } from '@/composables/use-realtime-socket'
import { useTokenStore } from '@/store/token'
import type { LevelUpResult, RpgStatus } from '@/types/rpg'
import { canUseRpgDevMock } from '@/utils/rpg-dev-mock-guard'

/** 与 server / use-realtime-socket ALL_EVENTS 对齐 */
export const RPG_ALL_WS_EVENTS: RealtimeSocketEvent[] = [
  'levelUp',
  'lifeChange',
  'banStatus',
  'achievementComplete',
  'questReward',
  'buffGranted',
  'questComplete',
  'expGain',
  'socialReceived',
  'tipReceived',
  'articleLevelUp',
  'masterpiece',
  'currencyChange',
  'rechargeComplete',
  'itemGranted',
  'lotteryTicketChange',
  'petHatched',
  'shieldUsed',
  'weatherBuff',
  'activityUpdate',
  'rankChange',
  'guildEvent',
  'buffExpired',
  'siteNotification',
]

export interface RpgMockContext {
  status?: RpgStatus | null
}

export interface RpgMockScenario {
  key: string
  group: string
  label: string
  event: RealtimeSocketEvent
  btnType?: 'primary' | 'warning' | 'error' | 'default'
  payload?: unknown | ((ctx: RpgMockContext) => unknown)
}

function isRpgDevMockEnabled() {
  return canUseRpgDevMock()
}

/** 注入本地 WS 事件（需 RpgGlobalInit 已挂载 handlers） */
export function dispatchRpgMockEvent(
  event: RealtimeSocketEvent,
  payload?: unknown,
  ctx: RpgMockContext = {},
): boolean {
  if (!isRpgDevMockEnabled())
    return false

  const tokenStore = useTokenStore()
  if (!tokenStore.hasLogin) {
    uni.showToast({ title: '[WS挡板] 请先登录', icon: 'none' })
    return false
  }

  dispatchLocalEvent(event, payload ?? buildDefaultRpgMockPayload(event, ctx))
  uni.showToast({ title: `[WS挡板] ${event}`, icon: 'none' })
  if (event === 'expGain') {
    setTimeout(() => {
      uni.showToast({ title: '[WS挡板] expGain Toast 约 5s 后合并', icon: 'none' })
    }, 300)
  }
  return true
}

export function runRpgMockScenario(scenario: RpgMockScenario, ctx: RpgMockContext = {}) {
  const payload = typeof scenario.payload === 'function' ? scenario.payload(ctx) : scenario.payload
  dispatchRpgMockEvent(scenario.event, payload, ctx)
}

export function buildMockLevelUp(status: RpgStatus | null): LevelUpResult {
  const oldLevel = Math.max(1, status?.level ?? 4)
  const newLevel = oldLevel + 1
  return {
    oldLevel,
    newLevel,
    unlockedRewards: [
      {
        level: newLevel,
        currencyReward: 50,
        currencyName: '钻石',
        avatarFrame: { code: 'frame_bronze', name: '中级头像框', rarity: 'rare' },
        title: { code: 'title_bronze', name: '青铜达人', rarity: 'rare' },
      },
    ],
  }
}

export function buildDefaultRpgMockPayload(event: RealtimeSocketEvent, ctx: RpgMockContext): unknown {
  const life = ctx.status?.lifeValue ?? 80
  const currency = ctx.status?.currency ?? 200
  const tickets = ctx.status?.lotteryTickets ?? 3

  const map: Record<RealtimeSocketEvent, unknown> = {
    levelUp: buildMockLevelUp(ctx.status ?? null),
    lifeChange: { lifeDeducted: 5, currentLife: Math.max(0, life - 5) },
    banStatus: {
      banned: true,
      banEndTime: new Date(Date.now() + 3600_000).toISOString(),
      banReason: '开发挡板：敏感词测试',
    },
    achievementComplete: {
      code: 'comment_master',
      name: '评论达人',
      expReward: 120,
      rarity: 'epic',
      rarityLabel: '史诗',
      rarityColor: '#8b5cf6',
      rarityIcon: '💎',
    },
    questReward: { questCode: 'daily_sign', questName: '每日签到', expReward: 30 },
    buffGranted: {
      code: 'exp_boost_small',
      name: '经验微增',
      description: '经验 +20%，1 小时',
      expireAt: new Date(Date.now() + 3600_000).toISOString(),
    },
    questComplete: {
      questCode: 'daily_comment',
      questName: '发表 1 条评论',
      expReward: 20,
      hpReward: 5,
    },
    expGain: { amount: 15, reasons: ['lottery'], reasonLabels: ['抽奖'] },
    socialReceived: {
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'cheer',
      hpDelta: 10,
      currentLife: Math.min(100, life + 10),
      reputationDelta: 0,
    },
    tipReceived: {
      fromUid: 2,
      fromNickname: '测试读者',
      amount: 50,
      articleId: 42,
      articleTitle: '从零搭建全栈博客系统',
      balance: currency + 50,
    },
    articleLevelUp: {
      articleId: 42,
      articleTitle: '测试文章',
      oldLevel: 2,
      newLevel: 3,
    },
    masterpiece: { articleId: 42, articleTitle: '从零搭建全栈博客系统' },
    currencyChange: {
      delta: 50,
      balance: currency + 50,
      reason: 'dev_mock',
      reasonLabel: '开发挡板',
    },
    rechargeComplete: { outTradeNo: 'mock-order', diamonds: 100, balance: currency + 100, amountYuan: 10 },
    itemGranted: {
      itemCode: 'lottery_title_writer',
      quantity: 1,
      source: 'lottery',
      sourceLabel: '抽奖',
      config: {
        name: '抽奖称号·作家',
        rarityLabel: '稀有',
        rarityColor: '#22c55e',
        itemTypeLabel: '称号',
      },
    },
    lotteryTicketChange: {
      delta: 1,
      total: tickets + 1,
      reason: 'lottery_reward',
      reasonLabel: '抽奖奖励',
    },
    petHatched: {
      petId: 1,
      petCode: 'pet_slime',
      name: '史莱姆',
      rarityLabel: '普通',
      rarityColor: '#c8d4e0',
    },
    shieldUsed: { buffName: '护盾卷轴' },
    weatherBuff: { label: '晴朗', expBoost: 0.1, weather: 'sunny' },
    activityUpdate: {
      type: 'start',
      activities: [
        { code: 'weekend_exp', name: '周末经验加成', description: 'EXP +20%', expBuffRate: 0.2 },
      ],
    },
    rankChange: { type: 'exp', period: 'week', rank: 3, score: 1280 },
    guildEvent: {
      type: 'memberJoined',
      guildId: 1,
      guildName: '测试公会',
      uid: 2,
      nickname: '新成员',
    },
    buffExpired: { code: 'exp_boost_small', name: '经验微增' },
    siteNotification: {
      notification: {
        id: Date.now(),
        type: 'comment',
        payload: { articleTitle: '测试文章', fromNickname: '读者甲' },
        read: false,
        createTime: new Date().toISOString(),
      },
      unreadCount: 1,
    },
  }

  return map[event]
}

export const RPG_MOCK_SCENARIOS: RpgMockScenario[] = [
  { key: 'level-up', group: '成长反馈', label: '升级', event: 'levelUp', btnType: 'warning' },
  { key: 'achievement', group: '成长反馈', label: '成就达成', event: 'achievementComplete', btnType: 'warning' },
  { key: 'masterpiece', group: '成长反馈', label: '神作晋升', event: 'masterpiece', btnType: 'warning' },
  { key: 'exp-gain', group: '成长反馈', label: '经验获得', event: 'expGain' },
  { key: 'article-level', group: '成长反馈', label: '文章升级', event: 'articleLevelUp' },
  { key: 'quest-complete', group: '任务', label: '任务完成', event: 'questComplete' },
  { key: 'quest-reward', group: '任务', label: '任务领奖', event: 'questReward' },
  {
    key: 'currency-plus',
    group: '经济物品',
    label: '钻石 +50',
    event: 'currencyChange',
    btnType: 'primary',
  },
  {
    key: 'currency-small',
    group: '经济物品',
    label: '钻石 +5',
    event: 'currencyChange',
    payload: (ctx: RpgMockContext) => ({
      delta: 5,
      balance: (ctx.status?.currency ?? 200) + 5,
      reason: 'dev_mock',
      reasonLabel: '开发挡板（小额）',
    }),
  },
  {
    key: 'currency-minus',
    group: '经济物品',
    label: '钻石 -10',
    event: 'currencyChange',
    btnType: 'warning',
    payload: (ctx: RpgMockContext) => ({
      delta: -10,
      balance: Math.max(0, (ctx.status?.currency ?? 200) - 10),
      reason: 'dev_mock',
      reasonLabel: '开发挡板',
    }),
  },
  { key: 'ticket-plus', group: '经济物品', label: '抽奖券 +1', event: 'lotteryTicketChange' },
  { key: 'item-granted', group: '经济物品', label: '获得物品', event: 'itemGranted' },
  {
    key: 'item-granted-epic',
    group: '经济物品',
    label: '史诗物品',
    event: 'itemGranted',
    btnType: 'primary',
    payload: () => ({
      itemCode: 'title_epic_writer',
      quantity: 1,
      source: 'quest',
      sourceLabel: '任务奖励',
      config: {
        name: '史诗称号·文豪',
        rarityLabel: '史诗',
        rarityColor: '#8b5cf6',
        itemTypeLabel: '称号',
      },
    }),
  },
  {
    key: 'item-granted-legendary',
    group: '经济物品',
    label: '传说物品',
    event: 'itemGranted',
    btnType: 'warning',
    payload: () => ({
      itemCode: 'frame_legendary_gold',
      quantity: 1,
      source: 'achievement',
      sourceLabel: '成就奖励',
      config: {
        name: '传说头像框·金辉',
        rarityLabel: '传说',
        rarityColor: '#f59e0b',
        itemTypeLabel: '头像框',
      },
    }),
  },
  { key: 'buff-granted', group: 'Buff', label: '获得 Buff', event: 'buffGranted' },
  { key: 'buff-expired', group: 'Buff', label: 'Buff 过期', event: 'buffExpired', btnType: 'warning' },
  { key: 'shield-used', group: 'Buff', label: '护盾抵消', event: 'shieldUsed' },
  { key: 'weather', group: 'Buff', label: '今日天气', event: 'weatherBuff' },
  {
    key: 'social-cheer',
    group: '社交互动',
    label: '收到加油',
    event: 'socialReceived',
    payload: (ctx: RpgMockContext) => ({
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'cheer',
      hpDelta: 10,
      currentLife: Math.min(100, (ctx.status?.lifeValue ?? 80) + 10),
      reputationDelta: 0,
    }),
  },
  {
    key: 'social-egg',
    group: '社交互动',
    label: '收到鸡蛋',
    event: 'socialReceived',
    btnType: 'warning',
    payload: (ctx: RpgMockContext) => ({
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'egg',
      hpDelta: -5,
      currentLife: Math.max(0, (ctx.status?.lifeValue ?? 80) - 5),
      reputationDelta: 0,
    }),
  },
  {
    key: 'social-flower',
    group: '社交互动',
    label: '收到鲜花',
    event: 'socialReceived',
    payload: {
      fromUid: 2,
      fromNickname: '测试冒险者',
      action: 'flower',
      hpDelta: 0,
      currentLife: 80,
      reputationDelta: 3,
    },
  },
  { key: 'tip-received', group: '社交互动', label: '收到打赏', event: 'tipReceived', btnType: 'primary' },
  {
    key: 'life-recover',
    group: '角色状态',
    label: '生命恢复',
    event: 'lifeChange',
    payload: (ctx: RpgMockContext) => ({
      lifeDeducted: 0,
      lifeRecovered: 10,
      currentLife: Math.min(100, (ctx.status?.lifeValue ?? 80) + 10),
    }),
  },
  {
    key: 'life-deduct',
    group: '角色状态',
    label: '敏感词扣血',
    event: 'lifeChange',
    btnType: 'warning',
    payload: (ctx: RpgMockContext) => ({
      lifeDeducted: 5,
      currentLife: Math.max(0, (ctx.status?.lifeValue ?? 80) - 5),
    }),
  },
  { key: 'ban', group: '角色状态', label: '禁言', event: 'banStatus', btnType: 'error' },
  { key: 'pet-hatch', group: '宠物公会排行', label: '宠物孵化', event: 'petHatched' },
  { key: 'guild-join', group: '宠物公会排行', label: '公会新成员', event: 'guildEvent' },
  { key: 'rank-change', group: '宠物公会排行', label: '排行榜变动', event: 'rankChange' },
  {
    key: 'rank-first',
    group: '宠物公会排行',
    label: '周榜第 1',
    event: 'rankChange',
    btnType: 'warning',
    payload: () => ({ type: 'exp', period: 'week', rank: 1, score: 12800 }),
  },
  { key: 'activity-start', group: '宠物公会排行', label: '活动开始', event: 'activityUpdate' },
  { key: 'site-notify', group: '站内通知', label: '新通知', event: 'siteNotification' },
]

export function getRpgMockEventCoverage() {
  const counts = new Map<RealtimeSocketEvent, number>()
  for (const s of RPG_MOCK_SCENARIOS)
    counts.set(s.event, (counts.get(s.event) ?? 0) + 1)
  return RPG_ALL_WS_EVENTS.map(event => ({
    event,
    covered: counts.has(event),
    scenarioCount: counts.get(event) ?? 0,
  }))
}

export function groupRpgMockScenarios(scenarios: RpgMockScenario[] = RPG_MOCK_SCENARIOS) {
  const order: string[] = []
  const map = new Map<string, RpgMockScenario[]>()
  for (const s of scenarios) {
    if (!map.has(s.group)) {
      map.set(s.group, [])
      order.push(s.group)
    }
    map.get(s.group)!.push(s)
  }
  return order.map(title => ({ title, items: map.get(title)! }))
}

/**
 * RPG 冒险页数据层（对齐 blog-home-nuxt use-rpg-page 核心能力）
 */
import { ref } from 'vue'
import type { BanStatus, RpgStatus, SignInfo } from '@/types/rpg'
import {
  activateBuff,
  claimQuestReward,
  createGuild,
  deactivateBuff,
  equipLoadout,
  getLotteryPool,
  getLotteryTickets,
  getMyAchievements,
  getMyBuffs,
  getMyGuild,
  getMyPets,
  getMyQuests,
  getPetCatalog,
  getRpgBanStatus,
  getRpgInventory,
  getRpgLeaderboard,
  getRpgLevelRewards,
  getRpgLoadout,
  getRpgSignInfo,
  getRpgStatus,
  joinGuild,
  leaveGuild,
  listGuilds,
  lotteryDraw,
  renamePet,
  rpgSignIn,
  summonPet,
  unequipLoadout,
} from '@/api/rpg'
import { createRpgRechargeOrder } from '@/api/rpg-recharge'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { initRpgRealtimeHandlers, registerRpgRefresh } from '@/composables/use-rpg-realtime-handlers'

export function useRpgPage() {
  const { playSfx } = useRpgAudio()
  const activeTab = ref<'status' | 'inventory' | 'pet' | 'guild' | 'leaderboard'>('status')
  const status = ref<RpgStatus | null>(null)
  const signInfo = ref<SignInfo | null>(null)
  const banStatus = ref<BanStatus | null>(null)
  const quests = ref<any[]>([])
  const achievements = ref<any[]>([])
  const buffs = ref<any[]>([])
  const levelRewards = ref<any[]>([])
  const lotteryPool = ref<any>(null)
  const lotteryTickets = ref(0)
  const inventory = ref<any[]>([])
  const loadout = ref<any>(null)
  const pets = ref<any[]>([])
  const petCatalog = ref<any[]>([])
  const guild = ref<any>(null)
  const guildList = ref<any[]>([])
  const leaderboard = ref<any[]>([])
  const leaderboardType = ref<'exp' | 'level' | 'reputation' | 'currency'>('exp')
  const loading = ref(false)
  const signingIn = ref(false)
  const drawing = ref(false)
  const showLevelUp = ref(false)
  const levelUpLevel = ref(0)
  const loadedTabs = ref(new Set<string>())
  let cleanupWs: (() => void) | null = null

  function parseQuests(data: any) {
    if (Array.isArray(data))
      return data
    return [...(data?.daily ?? []), ...(data?.bounty ?? []), ...(data?.special ?? [])]
  }

  async function loadStatusCore() {
    const [st, sign, ban, ach, questRes, buffList, tickets, rewards, pool] = await Promise.all([
      getRpgStatus(),
      getRpgSignInfo(),
      getRpgBanStatus().catch(() => null),
      getMyAchievements(),
      getMyQuests(),
      getMyBuffs(),
      getLotteryTickets().catch(() => ({ count: 0 })),
      getRpgLevelRewards().catch(() => []),
      getLotteryPool(),
    ])
    status.value = st
    signInfo.value = sign
    banStatus.value = ban
    achievements.value = (ach as any)?.list ?? ach ?? []
    quests.value = parseQuests(questRes)
    buffs.value = (buffList as any)?.list ?? buffList ?? []
    lotteryTickets.value = (tickets as any)?.count ?? tickets ?? 0
    levelRewards.value = (rewards as any)?.list ?? rewards ?? []
    lotteryPool.value = pool
  }

  async function loadTab(force = false) {
    if (!force && loadedTabs.value.has(activeTab.value))
      return
    loading.value = true
    try {
      switch (activeTab.value) {
        case 'status':
          await loadStatusCore()
          loadedTabs.value.add('status')
          break
        case 'inventory':
          inventory.value = ((await getRpgInventory()) as any)?.list ?? (await getRpgInventory()) ?? []
          loadout.value = await getRpgLoadout().catch(() => null)
          loadedTabs.value.add('inventory')
          break
        case 'pet':
          pets.value = ((await getMyPets()) as any)?.list ?? (await getMyPets()) ?? []
          petCatalog.value = ((await getPetCatalog()) as any)?.list ?? (await getPetCatalog()) ?? []
          loadedTabs.value.add('pet')
          break
        case 'guild':
          guild.value = await getMyGuild()
          guildList.value = ((await listGuilds(1)) as any)?.list ?? []
          loadedTabs.value.add('guild')
          break
        case 'leaderboard':
          leaderboard.value = ((await getRpgLeaderboard(leaderboardType.value)) as any)?.list ?? []
          loadedTabs.value.add('leaderboard')
          break
      }
    }
    finally {
      loading.value = false
    }
  }

  function init() {
    cleanupWs = initRpgRealtimeHandlers()
    const refreshStatus = () => {
      loadedTabs.value.delete('status')
      if (activeTab.value === 'status')
        void loadTab(true)
      else
        void loadStatusCore()
    }
    const refreshQuestsTab = () => {
      loadedTabs.value.delete('status')
      void loadTab(true)
    }
    const refreshInventoryTab = () => {
      loadedTabs.value.delete('inventory')
      void loadTab(true)
    }
    const refreshPetTab = () => {
      loadedTabs.value.delete('pet')
      void loadTab(true)
    }
    const refreshGuildTab = () => {
      loadedTabs.value.delete('guild')
      void loadTab(true)
    }
    const refreshLeaderboardTab = () => {
      loadedTabs.value.delete('leaderboard')
      void loadTab(true)
    }
    const unsubs = [
      registerRpgRefresh('status', refreshStatus),
      registerRpgRefresh('quests', refreshQuestsTab),
      registerRpgRefresh('inventory', refreshInventoryTab),
      registerRpgRefresh('pets', refreshPetTab),
      registerRpgRefresh('guild', refreshGuildTab),
      registerRpgRefresh('leaderboard', refreshLeaderboardTab),
    ]
    return () => {
      cleanupWs?.()
      unsubs.forEach(u => u())
    }
  }

  async function signIn() {
    signingIn.value = true
    try {
      const res = await rpgSignIn()
      playSfx('signIn')
      if (res?.levelUp) {
        levelUpLevel.value = res.levelUp.newLevel ?? status.value?.level ?? 0
        showLevelUp.value = true
        playSfx('levelUp')
      }
      uni.showToast({ title: res.message || '签到成功', icon: 'success' })
      loadedTabs.value.delete('status')
      await loadTab(true)
    }
    finally {
      signingIn.value = false
    }
  }

  async function claimQuest(code: string) {
    await claimQuestReward(code)
    playSfx('questReward')
    uni.showToast({ title: '奖励已领取', icon: 'success' })
    loadedTabs.value.delete('status')
    await loadTab(true)
  }

  async function drawLottery() {
    drawing.value = true
    try {
      await lotteryDraw(1)
      playSfx('lotteryRevealLegendary')
      uni.showToast({ title: '抽奖完成', icon: 'success' })
      loadedTabs.value.delete('status')
      await loadTab(true)
    }
    finally {
      drawing.value = false
    }
  }

  async function toggleBuff(buff: any) {
    if (buff.isActive)
      await deactivateBuff(buff.id)
    else
      await activateBuff(buff.id)
    loadedTabs.value.delete('status')
    await loadTab(true)
  }

  async function equipItem(slot: string, itemCode: string) {
    await equipLoadout({ slot, itemCode })
    playSfx('uiClick')
    loadedTabs.value.delete('inventory')
    await loadTab(true)
  }

  async function unequipItem(slot: string) {
    await unequipLoadout(slot)
    loadedTabs.value.delete('inventory')
    await loadTab(true)
  }

  async function hatchPet(itemCode: string) {
    await summonPet(itemCode)
    loadedTabs.value.delete('pet')
    await loadTab(true)
  }

  async function doRenamePet(id: number, nickname: string) {
    await renamePet(id, nickname)
    loadedTabs.value.delete('pet')
    await loadTab(true)
  }

  async function doCreateGuild(name: string) {
    await createGuild(name)
    loadedTabs.value.delete('guild')
    await loadTab(true)
  }

  async function doJoinGuild(guildId: number) {
    await joinGuild(guildId)
    loadedTabs.value.delete('guild')
    await loadTab(true)
  }

  async function doLeaveGuild() {
    await leaveGuild()
    loadedTabs.value.delete('guild')
    await loadTab(true)
  }

  async function recharge(amountYuan: number) {
    const order = await createRpgRechargeOrder(amountYuan)
    // #ifdef H5
    if (order.universalLink)
      window.open(order.universalLink, '_blank')
    // #endif
    // #ifdef MP-WEIXIN
    if (order.scheme)
      uni.showModal({ title: '充值', content: `订单 ${order.outTradeNo} 已创建` })
    // #endif
    return order
  }

  function switchTab(tab: typeof activeTab.value) {
    playSfx('tabSwitch')
    activeTab.value = tab
    void loadTab()
  }

  return {
    activeTab,
    status,
    signInfo,
    banStatus,
    quests,
    achievements,
    buffs,
    levelRewards,
    lotteryPool,
    lotteryTickets,
    inventory,
    loadout,
    pets,
    petCatalog,
    guild,
    guildList,
    leaderboard,
    leaderboardType,
    loading,
    signingIn,
    drawing,
    showLevelUp,
    levelUpLevel,
    loadTab,
    init,
    signIn,
    claimQuest,
    drawLottery,
    toggleBuff,
    equipItem,
    unequipItem,
    hatchPet,
    doRenamePet,
    doCreateGuild,
    doJoinGuild,
    doLeaveGuild,
    recharge,
    switchTab,
  }
}

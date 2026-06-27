/**
 * RPG 冒险页数据层（对齐 blog-home-nuxt use-rpg-page）
 * 仅由 pages-rpg/index 调用；mutation 在本 composable 内完成并 refresh 对应 ref
 */
import { ref } from 'vue'
import type {
  BanStatus,
  CurrentActivitiesOverview,
  DrawResult,
  InventoryItem,
  LeaderboardPeriod,
  LeaderboardScoreType,
  LevelReward,
  LotteryPoolItem,
  LotteryRecord,
  RpgStatus,
  SensitiveHitRecord,
  SignInfo,
  SignInResult,
  UserAchievementProgress,
  UserBuff,
  UserQuestProgress,
} from '@/types/rpg'
import {
  activateBuff,
  claimQuestReward,
  createGuild,
  deactivateBuff,
  equipLoadout,
  exchangePet,
  getCurrentActivity,
  getLotteryHistory,
  getLotteryPool,
  getLotteryTickets,
  getMyAchievements,
  getMyBuffs,
  getMyGuild,
  getMyPets,
  getMyQuests,
  getPetCatalog,
  getRpgBanStatus,
  getRpgHitRecords,
  getRpgInventory,
  getRpgLeaderboard,
  getRpgLevelRewards,
  getRpgLoadout,
  getRpgSignInfo,
  getRpgStatus,
  getWeatherBuff,
  joinGuild,
  leaveGuild,
  listGuilds,
  lotteryDraw,
  renamePet,
  rpgSignIn,
  summonPet,
  unequipLoadout,
} from '@/api/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { useRpgLotterySession } from '@/composables/use-rpg-lottery-session'
import { registerRpgRefresh } from '@/composables/use-rpg-realtime-handlers'
import type { RpgRefreshScope } from '@/composables/use-realtime-socket'
import { filterLinkedLotteryPool } from '@/utils/lottery-reel'
import { lotteryRevealSfxKey } from '@/constants/rpg-audio'

export type RpgTabKey = 'status' | 'inventory' | 'pet' | 'guild' | 'leaderboard'

export function useRpgPage() {
  const { playSfx } = useRpgAudio()
  const { lotteryDrawSessionActive, beginLotteryDrawSession, endLotteryDrawSession } = useRpgLotterySession()

  const activeTab = ref<RpgTabKey>('status')
  const rpgStatus = ref<RpgStatus | null>(null)
  const signInfo = ref<SignInfo | null>(null)
  const banStatus = ref<BanStatus | null>(null)
  const achievements = ref<UserAchievementProgress[]>([])
  const questGroups = ref<{
    daily: UserQuestProgress[]
    bounty: UserQuestProgress[]
    weekly: UserQuestProgress[]
    special: UserQuestProgress[]
  }>({ daily: [], bounty: [], weekly: [], special: [] })
  const buffs = ref<UserBuff[]>([])
  const levelRewards = ref<LevelReward[]>([])
  const lotteryPool = ref<LotteryPoolItem[]>([])
  const lotteryTickets = ref(0)
  const lotteryHistory = ref<LotteryRecord[]>([])
  const hitRecords = ref<SensitiveHitRecord[]>([])
  const hitRecordsTotal = ref(0)
  const activityOverview = ref<CurrentActivitiesOverview | null>(null)
  const weatherBuff = ref<any>(null)

  const inventoryItems = ref<InventoryItem[]>([])
  const loadout = ref<any>(null)
  const pets = ref<any[]>([])
  const petEggs = ref<any[]>([])
  const petCatalog = ref<any[]>([])
  const equippedPetId = ref<number | null>(null)
  const myGuild = ref<any>(null)
  const guildList = ref<any[]>([])
  const leaderboard = ref<any[]>([])

  const statusLoading = ref(false)
  const inventoryLoading = ref(false)
  const petLoading = ref(false)
  const guildLoading = ref(false)
  const leaderboardLoading = ref(false)
  const signingIn = ref(false)
  const drawing = ref(false)
  const showLevelUp = ref(false)
  const levelUpLevel = ref(0)
  const levelUpData = ref<SignInResult['levelUp'] | null>(null)

  const leaderboardType = ref<LeaderboardScoreType>('exp')
  const leaderboardPeriod = ref<LeaderboardPeriod>('total')
  const loadedTabs = ref(new Set<string>())

  // 兼容旧模板别名
  const status = rpgStatus
  const inventory = inventoryItems
  const guild = myGuild
  const quests = questGroups
  const loading = statusLoading

  function parseQuestGroups(data: any) {
    if (Array.isArray(data)) {
      questGroups.value = { daily: data, bounty: [], weekly: [], special: [] }
    }
    else {
      questGroups.value = {
        daily: data?.daily || [],
        bounty: data?.bounty || [],
        weekly: data?.weekly || [],
        special: data?.special || [],
      }
    }
  }

  async function loadStatusTab() {
    if (loadedTabs.value.has('status'))
      return
    statusLoading.value = true
    try {
      const [st, sign, ban, ach, questRes, buffList, ticketsRes, rewards, pool, act, weather] = await Promise.all([
        getRpgStatus(),
        getRpgSignInfo(),
        getRpgBanStatus().catch(() => null),
        getMyAchievements(),
        getMyQuests(),
        getMyBuffs(),
        getLotteryTickets().catch(() => ({ tickets: 0, count: 0 })),
        getRpgLevelRewards().catch(() => []),
        getLotteryPool(),
        getCurrentActivity().catch(() => null),
        getWeatherBuff().catch(() => null),
      ])
      rpgStatus.value = st
      signInfo.value = sign
      banStatus.value = ban
      achievements.value = (ach as any)?.list ?? ach ?? []
      parseQuestGroups(questRes)
      buffs.value = (buffList as any)?.list ?? buffList ?? []
      lotteryTickets.value = (ticketsRes as any)?.tickets ?? (ticketsRes as any)?.count ?? 0
      levelRewards.value = (rewards as any)?.list ?? rewards ?? []
      lotteryPool.value = filterLinkedLotteryPool((pool as any)?.list ?? pool ?? [])
      activityOverview.value = act as CurrentActivitiesOverview | null
      weatherBuff.value = weather
      loadedTabs.value.add('status')
    }
    finally {
      statusLoading.value = false
    }
  }

  let reloadStatusCoreTask: Promise<void> | null = null
  async function reloadStatusCore() {
    if (reloadStatusCoreTask)
      return reloadStatusCoreTask
    reloadStatusCoreTask = (async () => {
      const [st, sign, ban, ticketsRes] = await Promise.all([
        getRpgStatus(),
        getRpgSignInfo(),
        getRpgBanStatus().catch(() => null),
        getLotteryTickets().catch(() => ({ tickets: 0 })),
      ])
      rpgStatus.value = st
      signInfo.value = sign
      banStatus.value = ban
      lotteryTickets.value = (ticketsRes as any)?.tickets ?? (ticketsRes as any)?.count ?? 0
    })().finally(() => {
      reloadStatusCoreTask = null
    })
    return reloadStatusCoreTask
  }

  async function reloadAchievements() {
    const ach = await getMyAchievements()
    achievements.value = (ach as any)?.list ?? ach ?? []
  }

  async function reloadQuests() {
    parseQuestGroups(await getMyQuests())
  }

  async function reloadBuffs() {
    const buffList = await getMyBuffs()
    buffs.value = (buffList as any)?.list ?? buffList ?? []
  }

  async function loadHitRecords() {
    const res = await getRpgHitRecords(1, 10)
    hitRecords.value = (res as any)?.list ?? []
    hitRecordsTotal.value = (res as any)?.pagination?.total ?? 0
  }

  async function loadLotteryHistory() {
    const res = await getLotteryHistory(1)
    lotteryHistory.value = (res as any)?.list ?? []
  }

  async function loadInventoryTab() {
    if (loadedTabs.value.has('inventory'))
      return
    inventoryLoading.value = true
    try {
      const [inv, lo] = await Promise.all([getRpgInventory(), getRpgLoadout()])
      inventoryItems.value = (inv as any)?.items ?? (inv as any)?.list ?? inv ?? []
      loadout.value = lo
      loadedTabs.value.add('inventory')
    }
    finally {
      inventoryLoading.value = false
    }
  }

  async function reloadInventory() {
    const [inv, lo] = await Promise.all([getRpgInventory(), getRpgLoadout()])
    inventoryItems.value = (inv as any)?.items ?? (inv as any)?.list ?? inv ?? []
    loadout.value = lo
  }

  async function loadPetTab() {
    const isFirst = !loadedTabs.value.has('pet')
    if (isFirst)
      petLoading.value = true
    try {
      const cat = await getPetCatalog()
      petCatalog.value = (cat as any)?.list ?? cat ?? []
      if (isFirst) {
        const [p, inv, lo] = await Promise.all([
          getMyPets().catch(() => []),
          getRpgInventory('consumable').catch(() => ({ items: [] })),
          getRpgLoadout().catch(() => null),
        ])
        pets.value = (p as any)?.list ?? p ?? []
        const items = (inv as any)?.items ?? (inv as any)?.list ?? []
        petEggs.value = items.filter((i: any) => i.config?.effectJson?.grantType === 'pet')
        equippedPetId.value = (lo as any)?.petId ?? null
        loadedTabs.value.add('pet')
      }
    }
    finally {
      if (isFirst)
        petLoading.value = false
    }
  }

  async function reloadPetTab() {
    const [p, inv, cat, lo] = await Promise.all([
      getMyPets().catch(() => []),
      getRpgInventory('consumable').catch(() => ({ items: [] })),
      getPetCatalog().catch(() => []),
      getRpgLoadout().catch(() => null),
    ])
    pets.value = (p as any)?.list ?? p ?? []
    const items = (inv as any)?.items ?? (inv as any)?.list ?? []
    petEggs.value = items.filter((i: any) => i.config?.effectJson?.grantType === 'pet')
    petCatalog.value = (cat as any)?.list ?? cat ?? []
    equippedPetId.value = lo?.petId ?? null
  }

  async function loadGuildTab() {
    if (loadedTabs.value.has('guild'))
      return
    guildLoading.value = true
    try {
      myGuild.value = await getMyGuild()
      if (!myGuild.value) {
        const res = await listGuilds(1)
        guildList.value = (res as any)?.list ?? []
      }
      loadedTabs.value.add('guild')
    }
    finally {
      guildLoading.value = false
    }
  }

  async function reloadGuildTab() {
    myGuild.value = await getMyGuild()
    if (!myGuild.value) {
      const res = await listGuilds(1)
      guildList.value = (res as any)?.list ?? []
    }
    else {
      guildList.value = []
    }
  }

  async function loadLeaderboardTab() {
    leaderboardLoading.value = true
    try {
      const res = await getRpgLeaderboard(leaderboardType.value, 50, leaderboardPeriod.value)
      leaderboard.value = (res as any)?.list ?? res ?? []
      loadedTabs.value.add('leaderboard')
    }
    finally {
      leaderboardLoading.value = false
    }
  }

  async function loadTab(force = false) {
    if (force) {
      loadedTabs.value.delete(activeTab.value)
    }
    switch (activeTab.value) {
      case 'status':
        await loadStatusTab()
        break
      case 'inventory':
        await loadInventoryTab()
        break
      case 'pet':
        await loadPetTab()
        break
      case 'guild':
        await loadGuildTab()
        break
      case 'leaderboard':
        await loadLeaderboardTab()
        break
    }
  }

  async function signIn() {
    signingIn.value = true
    try {
      const result = await rpgSignIn()
      playSfx('signIn')
      if (result?.levelUp) {
        levelUpData.value = result.levelUp
        levelUpLevel.value = result.levelUp.newLevel
        showLevelUp.value = true
        playSfx('levelUp')
      }
      uni.showToast({ title: result.message || '签到成功', icon: 'success' })
      loadedTabs.value.delete('status')
      await Promise.all([reloadStatusCore(), reloadQuests()])
      await loadStatusTab()
      return result
    }
    finally {
      signingIn.value = false
    }
  }

  async function claimQuest(code: string) {
    await claimQuestReward(code)
    playSfx('questReward')
    uni.showToast({ title: '奖励已领取', icon: 'success' })
    await Promise.all([reloadQuests(), reloadStatusCore()])
    loadedTabs.value.delete('status')
    await loadStatusTab()
  }

  async function handleDraw(count: number, currency: 'ticket' | 'currency'): Promise<DrawResult[]> {
    drawing.value = true
    try {
      const res = await lotteryDraw(count, currency)
      const results = (res as any)?.results ?? (Array.isArray(res) ? res : [])
      const best = results[results.length - 1]
      if (best?.item?.rarity)
        playSfx(lotteryRevealSfxKey(best.item.rarity) as any)
      return results
    }
    finally {
      drawing.value = false
    }
  }

  const LOTTERY_INVENTORY_GRANT_TYPES = new Set(['item', 'cosmetic', 'consumable', 'pet', 'avatar_frame', 'title'])

  async function refreshAfterDraw(results: DrawResult[] = []) {
    try {
      await reloadStatusCore()
      const needsInventory = results.some(r => LOTTERY_INVENTORY_GRANT_TYPES.has(r.item.type))
      const needsBuffs = results.some(r => r.item.type === 'buff')
      const reloads: Promise<unknown>[] = []
      if (needsInventory && loadedTabs.value.has('inventory'))
        reloads.push(reloadInventory())
      if (needsBuffs)
        reloads.push(reloadBuffs())
      if (reloads.length)
        await Promise.all(reloads)
    }
    finally {
      endLotteryDrawSession()
    }
  }

  async function toggleBuff(buff: UserBuff & { triggerMode?: string, isActive?: boolean }) {
    if (buff.triggerMode === 'manual') {
      if (buff.isActive)
        await deactivateBuff(buff.id)
      else
        await activateBuff(buff.id)
      await reloadBuffs()
    }
  }

  async function equipItem(slot: string, itemCode: string) {
    await equipLoadout({ slot, itemCode })
    playSfx('uiClick')
    await reloadInventory()
  }

  async function unequipItem(slot: string) {
    await unequipLoadout(slot)
    await reloadInventory()
  }

  async function hatchPet(itemCode: string) {
    await summonPet(itemCode)
    playSfx('petHatch' as any)
    await reloadPetTab()
  }

  async function doBuyPet(petCode: string) {
    await exchangePet(petCode)
    await reloadPetTab()
  }

  async function doDeployPet(petId: number) {
    await equipLoadout({ slot: 'pet', petId })
    equippedPetId.value = petId
  }

  async function doRestPet() {
    await unequipLoadout('pet')
    equippedPetId.value = null
  }

  async function doRenamePet(id: number, nickname: string) {
    await renamePet(id, nickname)
    await reloadPetTab()
  }

  async function doCreateGuild(name: string) {
    await createGuild(name)
    await reloadGuildTab()
  }

  async function doJoinGuild(guildId: number) {
    await joinGuild(guildId)
    await reloadGuildTab()
  }

  async function doLeaveGuild() {
    await leaveGuild()
    await reloadGuildTab()
  }

  async function handleSocketRefresh(scope: RpgRefreshScope) {
    if (lotteryDrawSessionActive.value && (scope === 'status' || scope === 'inventory'))
      return
    if (scope === 'status')
      await reloadStatusCore()
    else if (scope === 'achievements')
      await reloadAchievements()
    else if (scope === 'quests')
      await reloadQuests()
    else if (scope === 'buffs')
      await reloadBuffs()
    else if (scope === 'inventory')
      await reloadInventory()
    else if (scope === 'pets')
      await reloadPetTab()
    else if (scope === 'guild')
      await reloadGuildTab()
    else if (scope === 'leaderboard' && loadedTabs.value.has('leaderboard'))
      await loadLeaderboardTab()
  }

  function switchTab(tab: RpgTabKey) {
    playSfx('tabSwitch')
    activeTab.value = tab
    void loadTab()
  }

  function init() {
    const unsubs = [
      registerRpgRefresh('status', () => handleSocketRefresh('status')),
      registerRpgRefresh('quests', () => handleSocketRefresh('quests')),
      registerRpgRefresh('achievements', () => handleSocketRefresh('achievements')),
      registerRpgRefresh('inventory', () => handleSocketRefresh('inventory')),
      registerRpgRefresh('pets', () => handleSocketRefresh('pets')),
      registerRpgRefresh('guild', () => handleSocketRefresh('guild')),
      registerRpgRefresh('leaderboard', () => handleSocketRefresh('leaderboard')),
      registerRpgRefresh('buffs', () => handleSocketRefresh('buffs')),
    ]
    return () => unsubs.forEach(u => u())
  }

  return {
    activeTab,
    rpgStatus,
    status,
    signInfo,
    banStatus,
    achievements,
    questGroups,
    quests,
    buffs,
    levelRewards,
    lotteryPool,
    lotteryTickets,
    lotteryHistory,
    hitRecords,
    hitRecordsTotal,
    activityOverview,
    weatherBuff,
    inventoryItems,
    inventory,
    loadout,
    pets,
    petEggs,
    petCatalog,
    equippedPetId,
    myGuild,
    guild,
    guildList,
    leaderboard,
    statusLoading,
    inventoryLoading,
    petLoading,
    guildLoading,
    leaderboardLoading,
    loading,
    signingIn,
    drawing,
    showLevelUp,
    levelUpLevel,
    levelUpData,
    leaderboardType,
    leaderboardPeriod,
    loadTab,
    loadHitRecords,
    loadLotteryHistory,
    signIn,
    claimQuest,
    handleDraw,
    beginLotteryDrawSession,
    refreshAfterDraw,
    toggleBuff,
    equipItem,
    unequipItem,
    hatchPet,
    doBuyPet,
    doDeployPet,
    doRestPet,
    doRenamePet,
    doCreateGuild,
    doJoinGuild,
    doLeaveGuild,
    switchTab,
    init,
    reloadStatusCore,
  }
}

/**
 * 全站 RPG 共享状态（对齐 blog-home-nuxt use-rpg，供 GlobalInit 与文章页复用）
 */
import { computed, ref } from 'vue'
import type { BanStatus, RpgStatus, SignInfo, UserBuff, UserQuestProgress } from '@/types/rpg'
import {
  getMyBuffs,
  getMyQuests,
  getRpgBanStatus,
  getRpgSignInfo,
  getRpgStatus,
} from '@/api/rpg'

const rpgStatus = ref<RpgStatus | null>(null)
const signInfo = ref<SignInfo | null>(null)
const banStatus = ref<BanStatus | null>(null)
const buffs = ref<UserBuff[]>([])
const questGroups = ref<{
  daily: UserQuestProgress[]
  bounty: UserQuestProgress[]
  weekly: UserQuestProgress[]
  special: UserQuestProgress[]
}>({ daily: [], bounty: [], weekly: [], special: [] })

const inflight: Record<string, Promise<void> | null> = {}

function runDeduped(key: string, task: () => Promise<void>): Promise<void> {
  if (inflight[key])
    return inflight[key]!
  const p = task().finally(() => {
    inflight[key] = null
  })
  inflight[key] = p
  return p
}

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

export function useRpg() {
  const isBanned = computed(() => banStatus.value?.banned ?? false)

  const fetchStatus = () => runDeduped('status', async () => {
    rpgStatus.value = await getRpgStatus()
  })

  const fetchSignInfo = () => runDeduped('signInfo', async () => {
    signInfo.value = await getRpgSignInfo()
  })

  const fetchBanStatus = () => runDeduped('banStatus', async () => {
    banStatus.value = await getRpgBanStatus()
  })

  const fetchQuests = () => runDeduped('quests', async () => {
    parseQuestGroups(await getMyQuests())
  })

  const fetchBuffs = () => runDeduped('buffs', async () => {
    const res = await getMyBuffs()
    buffs.value = (res as any)?.list ?? res ?? []
  })

  const initCore = async () => {
    await Promise.all([fetchStatus(), fetchSignInfo(), fetchBanStatus(), fetchQuests()])
  }

  return {
    rpgStatus,
    signInfo,
    banStatus,
    buffs,
    questGroups,
    isBanned,
    fetchStatus,
    fetchSignInfo,
    fetchBanStatus,
    fetchQuests,
    fetchBuffs,
    initCore,
  }
}

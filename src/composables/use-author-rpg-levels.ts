/**
 * 批量缓存作者 RPG 等级（文章列表作者徽章，对齐 blog-home-nuxt use-author-rpg-levels）
 */
import { ref } from 'vue'
import { getPublicRpgStatusBatch } from '@/api/profile'

interface AuthorRpgBrief {
  level: number
}

const levelCache = ref<Record<number, AuthorRpgBrief>>({})
let batchInflight: Promise<void> | null = null
const pendingUids: number[] = []

function getAuthorLevel(uid?: number | null): number | null {
  if (!uid)
    return null
  return levelCache.value[uid]?.level ?? null
}

function applyBatchResult(uids: number[], data: Record<string, { level?: number }>) {
  const next = { ...levelCache.value }
  for (const uid of uids) {
    const brief = data[String(uid)]
    next[uid] = { level: brief?.level ?? 1 }
  }
  levelCache.value = next
}

async function flushPendingBatch() {
  while (pendingUids.length) {
    const batch = [...new Set(pendingUids)].filter(uid => levelCache.value[uid] === undefined)
    pendingUids.length = 0
    if (!batch.length)
      return

    try {
      const res = await getPublicRpgStatusBatch(batch)
      applyBatchResult(batch, res ?? {})
    }
    catch {
      applyBatchResult(batch, {})
    }
  }
}

/** 批量拉取作者等级（并发调用会合并为单次请求） */
async function fetchLevelsForUids(uids: Array<number | string | null | undefined>) {
  const unique = [...new Set(
    uids.map(uid => Number(uid)).filter(id => id > 0),
  )]
  const need = unique.filter(uid => levelCache.value[uid] === undefined)
  if (!need.length)
    return

  pendingUids.push(...need)

  if (!batchInflight) {
    batchInflight = flushPendingBatch().finally(() => {
      batchInflight = null
    })
  }

  await batchInflight
}

export function useAuthorRpgLevels() {
  return {
    levelCache,
    getAuthorLevel,
    fetchLevelsForUids,
  }
}

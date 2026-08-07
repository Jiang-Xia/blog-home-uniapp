/**
 * 当前登录用户装备头像框（对齐 blog-home-nuxt useEquippedAvatarFrame）
 * uni-app 无全局 rpgStatus，按需拉取 getRpgStatus
 */
import { getRpgStatus } from '@/api/rpg'
import type { RpgStatus } from '@/types/rpg'
import { resolveAvatarFrameFromRpgStatus } from '@/utils/avatar-frame'

export function useEquippedAvatarFrame() {
  const rpgStatus = ref<RpgStatus | null>(null)

  const frame = computed(() => resolveAvatarFrameFromRpgStatus(rpgStatus.value))

  /** 拉取最新 RPG 状态并更新头像框 */
  async function refresh() {
    try {
      rpgStatus.value = await getRpgStatus()
    }
    catch {
      rpgStatus.value = null
    }
  }

  return { frame, rpgStatus, refresh }
}

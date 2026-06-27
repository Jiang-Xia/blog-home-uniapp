/**
 * RPG 头像框展示解析（对齐 blog-home-nuxt composables/use-avatar-frame.ts）
 */
import type { AvatarFrameInfo, RpgStatus } from '@/types/rpg'

/** 从公开 loadout / userInfo 解析头像框展示信息 */
export function resolvePublicAvatarFrame(
  frame:
    | {
      code?: string
      name?: string
      color?: string | null
      effectJson?: { color?: string }
    }
    | null
    | undefined,
): AvatarFrameInfo | null {
  if (!frame)
    return null
  const color = frame.color ?? frame.effectJson?.color ?? null
  if (!frame.code && !frame.name && !color)
    return null
  return {
    code: frame.code ?? '',
    name: frame.name ?? frame.code ?? '',
    color,
  }
}

/** 从 RPG 状态解析当前应展示的头像框（仅已穿戴时返回） */
export function resolveAvatarFrameFromRpgStatus(
  status: RpgStatus | null | undefined,
): AvatarFrameInfo | null {
  if (!status?.equippedAvatarFrame)
    return null
  const equipped = status.unlockedAvatarFrames?.find(
    item => item.code === status.equippedAvatarFrame,
  )
  if (!equipped)
    return null
  return {
    code: equipped.code,
    name: equipped.name,
    color: equipped.color ?? null,
  }
}

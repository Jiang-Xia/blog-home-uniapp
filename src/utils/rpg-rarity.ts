import type { RarityDisplayFields } from '@/types/rpg'

export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary'

export const RARITY_SILVER_COLOR = '#c8d4e0'

const LABEL_TO_TIER: Record<string, RarityTier> = {
  普通: 'common',
  稀有: 'rare',
  史诗: 'epic',
  传说: 'legendary',
}

const KNOWN_RARITY_COLORS: Record<string, RarityTier> = {
  '#c8d4e0': 'common',
  '#22c55e': 'rare',
  '#8b5cf6': 'epic',
  '#f59e0b': 'legendary',
}

export function rarityLabelToTier(rarityLabel?: string): RarityTier {
  return LABEL_TO_TIER[rarityLabel ?? ''] ?? 'common'
}

export function rarityCodeToTier(rarity: string): RarityTier {
  if (rarity === 'legendary')
    return 'legendary'
  if (rarity === 'epic')
    return 'epic'
  if (rarity === 'rare')
    return 'rare'
  return 'common'
}

export function isCommonRarity(rarity?: string | null, rarityLabel?: string | null): boolean {
  if (rarity === 'common')
    return true
  if (rarityLabel === '普通')
    return true
  return false
}

export function isSilverRarityColor(color?: string | null): boolean {
  if (!color)
    return false
  return color.toLowerCase() === RARITY_SILVER_COLOR.toLowerCase()
}

export function shouldUseSilverRarityStyle(fields: RarityDisplayFields): boolean {
  return isCommonRarity(fields.rarity, fields.rarityLabel) || isSilverRarityColor(fields.rarityColor)
}

export function resolveRarityTier(fields: RarityDisplayFields): RarityTier | null {
  if (shouldUseSilverRarityStyle(fields))
    return 'common'
  if (fields.rarity)
    return rarityCodeToTier(fields.rarity)
  if (fields.rarityLabel) {
    const tier = LABEL_TO_TIER[fields.rarityLabel]
    if (tier)
      return tier
  }
  if (fields.rarityColor)
    return KNOWN_RARITY_COLORS[fields.rarityColor.toLowerCase()] ?? null
  return null
}

export function buildRarityMetallicGradient(
  highlight: string,
  light: string,
  main: string,
  shadow: string,
  edge: string,
): string {
  return `linear-gradient(145deg, ${highlight} 0%, ${light} 28%, ${main} 55%, ${shadow} 78%, ${edge} 100%)`
}

export function buildRarityMetallicBadgeStyle(color: string): Record<string, string> {
  return {
    background: buildRarityMetallicGradient(`${color}40`, `${color}cc`, color, `${color}99`, `${color}55`),
    color,
    borderColor: color,
  }
}

export function getRarityBadgePresentation(fields: RarityDisplayFields): {
  class?: string
  style?: Record<string, string>
} {
  const tier = resolveRarityTier(fields)
  if (tier)
    return { class: `rpg-rarity-badge--${tier}` }
  return { style: buildRarityMetallicBadgeStyle(fields.rarityColor || getRarityFallbackColor()) }
}

export function getRarityBadgeClass(fields: RarityDisplayFields): string | undefined {
  return getRarityBadgePresentation(fields).class
}

export function getRarityInlineStyle(fields: RarityDisplayFields): Record<string, string> | undefined {
  return getRarityBadgePresentation(fields).style
}

export function resolveRarityDisplayColor(fields: RarityDisplayFields): string {
  return fields.rarityColor || getRarityFallbackColor()
}

export function getRarityFallbackColor(): string {
  return RARITY_SILVER_COLOR
}

export function shouldShowItemRevealCelebration(rarityLabel?: string): boolean {
  const tier = rarityLabelToTier(rarityLabel)
  return tier === 'epic' || tier === 'legendary'
}

export function rankToConfettiTier(rank: number): RarityTier {
  if (rank === 1)
    return 'legendary'
  if (rank <= 3)
    return 'epic'
  return 'rare'
}

export function getRarityGlow(tier: RarityTier): string {
  const map: Record<RarityTier, string> = {
    common: '0 0 28px rgba(200, 212, 224, 0.45)',
    rare: '0 0 36px rgba(34, 197, 94, 0.55)',
    epic: '0 0 48px rgba(139, 92, 246, 0.65)',
    legendary: '0 0 60px rgba(245, 158, 11, 0.85)',
  }
  return map[tier]
}

export function getRarityGlowByCode(rarity: string): string {
  return getRarityGlow(rarityCodeToTier(rarity))
}

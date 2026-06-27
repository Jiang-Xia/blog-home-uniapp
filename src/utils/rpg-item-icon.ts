export const ITEM_ICON_MAP: Record<string, string> = {
  'pet_slime': '🫧',
  'pet_fox': '🦊',
  'pet_dragon': '🐉',
  'pet_phoenix': '🐦‍🔥',
  'pet_owl': '🦉',
  'pet_kirin': '🦄',
  'slime': '🫧',
  'fox': '🦊',
  'dragon': '🐉',
  'phoenix': '🐦‍🔥',
  'owl': '🦉',
  'kirin': '🦄',
  'egg': '🥚',
  'frame-green': '💚',
  'frame-blue': '💙',
  'frame-purple': '💜',
  'frame-gold': '💛',
  'starburst': '💫',
  'sun': '☀️',
  'rainbow': '🌈',
  'moon': '🌙',
  'medal-bronze': '🥉',
  'medal-silver': '🥈',
  'medal-gold': '🥇',
  'crown': '👑',
  'shield': '🛡️',
  'quill': '✒️',
  'cat': '🐱',
  'exp': '✨',
  'gem': '🔮',
  'ticket': '🎟️',
  'scroll': '📜',
  'diamond': '💎',
  'pen': '✒️',
  'books': '📚',
  'library': '📖',
  'chat': '💬',
  'megaphone': '📣',
  'reply': '↩️',
  'board': '📋',
  'calendar': '📅',
  'calendar-check': '✅',
  'trophy': '🏆',
  'fire': '🔥',
  'flame': '🔥',
  'heart': '❤️',
  'hearts': '💕',
  'bookmark': '🔖',
  'bookmarks': '🔖',
  'star': '⭐',
  'stars': '✨',
  'crown-star': '👑',
  'share': '🔗',
  'default': '📦',
}

export interface RpgItemIconSource {
  icon?: string | null
  itemTypeIcon?: string | null
}

export function resolveRpgItemEmoji(source?: RpgItemIconSource | null): string {
  if (!source)
    return ITEM_ICON_MAP.default ?? '📦'
  const key = source.icon?.trim()
  if (key && key !== 'default') {
    const mapped = ITEM_ICON_MAP[key]
    if (mapped)
      return mapped
  }
  if (source.itemTypeIcon)
    return source.itemTypeIcon
  return ITEM_ICON_MAP.default ?? '📦'
}

export function resolveRpgItemTint(
  source?: { rarityColor?: string | null, color?: string | null } | null,
): string | undefined {
  return source?.rarityColor || source?.color || undefined
}

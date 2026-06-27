/**
 * RPG 音频键名与音量配置（对齐 blog-home-nuxt，MP/H5 使用 InnerAudioContext + 合成音 fallback）
 */
export const RPG_AUDIO_STORAGE_KEY = 'rpg_audio_settings'

export type RpgSynthSfxKey
  = | 'uiClick'
    | 'lotteryCharge'
    | 'lotterySpin'
    | 'lotteryTick'
    | 'lotteryRevealCommon'
    | 'lotteryRevealRare'
    | 'lotteryRevealEpic'
    | 'levelUp'
    | 'achievement'
    | 'signIn'
    | 'questReward'
    | 'tabSwitch'
    | 'equip'
    | 'unequip'
    | 'buffActivate'
    | 'buffDeactivate'
    | 'petDeploy'
    | 'petRest'
    | 'petHatch'
    | 'petBuy'
    | 'petRename'
    | 'guildCreate'
    | 'guildJoin'
    | 'guildLeave'
    | 'rankUp'
    | 'questComplete'
    | 'currencyGain'
    | 'banPunish'
    | 'socialCheer'
    | 'socialFlower'
    | 'socialEgg'
    | 'socialTip'

export type RpgFileSfxKey = 'lotteryRevealLegendary'

export type RpgSfxKey = RpgSynthSfxKey | RpgFileSfxKey

export type RpgBgmKey = 'adventure'

export const RPG_SYNTH_SFX: Record<RpgSynthSfxKey, { volume: number }> = {
  uiClick: { volume: 0.35 },
  lotteryCharge: { volume: 0.45 },
  lotterySpin: { volume: 0.3 },
  lotteryTick: { volume: 0.4 },
  lotteryRevealCommon: { volume: 0.5 },
  lotteryRevealRare: { volume: 0.55 },
  lotteryRevealEpic: { volume: 0.6 },
  levelUp: { volume: 0.6 },
  achievement: { volume: 0.55 },
  signIn: { volume: 0.5 },
  questReward: { volume: 0.45 },
  tabSwitch: { volume: 0.28 },
  equip: { volume: 0.42 },
  unequip: { volume: 0.35 },
  buffActivate: { volume: 0.4 },
  buffDeactivate: { volume: 0.32 },
  petDeploy: { volume: 0.48 },
  petRest: { volume: 0.32 },
  petHatch: { volume: 0.5 },
  petBuy: { volume: 0.45 },
  petRename: { volume: 0.3 },
  guildCreate: { volume: 0.5 },
  guildJoin: { volume: 0.42 },
  guildLeave: { volume: 0.35 },
  rankUp: { volume: 0.52 },
  questComplete: { volume: 0.4 },
  currencyGain: { volume: 0.46 },
  banPunish: { volume: 0.5 },
  socialCheer: { volume: 0.45 },
  socialFlower: { volume: 0.45 },
  socialEgg: { volume: 0.4 },
  socialTip: { volume: 0.5 },
}

export const RPG_FILE_SFX: Record<RpgFileSfxKey, { src: string, volume: number }> = {
  lotteryRevealLegendary: { src: '/static/audio/rpg/sfx-lottery-reveal-legendary.mp3', volume: 0.65 },
}

export const RPG_BGM: Record<RpgBgmKey, { src: string, loop: boolean, volume: number }> = {
  adventure: { src: '/static/audio/rpg/bgm-adventure.mp3', loop: true, volume: 0.18 },
}

/** 兼容旧 API */
export const RPG_SFX_VOLUME: Partial<Record<RpgSfxKey, number>> = Object.fromEntries(
  Object.entries(RPG_SYNTH_SFX).map(([k, v]) => [k, v.volume]),
) as Partial<Record<RpgSfxKey, number>>

export function lotteryRevealSfxKey(rarity: string): RpgSfxKey {
  if (rarity === 'legendary')
    return 'lotteryRevealLegendary'
  if (rarity === 'epic')
    return 'lotteryRevealEpic'
  if (rarity === 'rare')
    return 'lotteryRevealRare'
  return 'lotteryRevealCommon'
}

export function itemGrantedSfxKey(rarityLabel?: string): RpgSfxKey {
  const map: Record<string, RpgSfxKey> = {
    普通: 'lotteryRevealCommon',
    稀有: 'lotteryRevealRare',
    史诗: 'lotteryRevealEpic',
    传说: 'lotteryRevealLegendary',
  }
  return map[rarityLabel ?? ''] ?? 'lotteryRevealCommon'
}

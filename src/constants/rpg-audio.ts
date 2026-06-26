/** RPG 音频键名（简化版，H5/MP 使用 InnerAudioContext） */
export const RPG_AUDIO_STORAGE_KEY = 'rpg_audio_settings'

export type RpgSfxKey
  = | 'uiClick'
    | 'signIn'
    | 'levelUp'
    | 'questReward'
    | 'lotteryRevealLegendary'
    | 'tabSwitch'

export type RpgBgmKey = 'adventure'

export const RPG_SFX_VOLUME: Record<RpgSfxKey, number> = {
  uiClick: 0.35,
  signIn: 0.5,
  levelUp: 0.6,
  questReward: 0.55,
  lotteryRevealLegendary: 0.7,
  tabSwitch: 0.3,
}

/**
 * RPG 音效 composable（简化版）
 * - H5 Web Audio 提示音；音量/静音写入 uni.storage
 * - BGM 素材未打包，playBgm 暂为占位
 */
import { computed, ref } from 'vue'
import { RPG_AUDIO_STORAGE_KEY, RPG_SFX_VOLUME } from '@/constants/rpg-audio'
import type { RpgBgmKey, RpgSfxKey } from '@/constants/rpg-audio'

interface RpgAudioSettings {
  muted: boolean
  sfxVolume: number
}

const DEFAULT: RpgAudioSettings = { muted: false, sfxVolume: 0.85 }
const settings = ref<RpgAudioSettings>(readSettings())
const audioPool: UniApp.InnerAudioContext[] = []

function readSettings(): RpgAudioSettings {
  try {
    const raw = uni.getStorageSync(RPG_AUDIO_STORAGE_KEY)
    if (!raw)
      return { ...DEFAULT }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { muted: !!parsed.muted, sfxVolume: Math.min(1, Math.max(0, parsed.sfxVolume ?? DEFAULT.sfxVolume)) }
  }
  catch {
    return { ...DEFAULT }
  }
}

function persist() {
  uni.setStorageSync(RPG_AUDIO_STORAGE_KEY, JSON.stringify(settings.value))
}

function playTone(freq: number, durationMs = 120) {
  // #ifdef H5
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    gain.gain.value = settings.value.sfxVolume * 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      void ctx.close()
    }, durationMs)
  }
  catch { /* ignore */ }
  // #endif
}

const sfxFreq: Partial<Record<RpgSfxKey, number>> = {
  uiClick: 880,
  signIn: 660,
  levelUp: 523,
  questReward: 740,
  lotteryRevealLegendary: 988,
  tabSwitch: 520,
}

export function useRpgAudio() {
  const muted = computed({
    get: () => settings.value.muted,
    set: (v: boolean) => {
      settings.value.muted = v
      persist()
    },
  })

  function playSfx(key: RpgSfxKey) {
    if (settings.value.muted)
      return
    const base = RPG_SFX_VOLUME[key] ?? 0.4
    const vol = settings.value.sfxVolume * base
    if (vol <= 0)
      return
    playTone(sfxFreq[key] ?? 600)
  }

  function playBgm(_key: RpgBgmKey = 'adventure') {
    // BGM 素材未打包进 uniapp，暂用静音占位；后续可放 static/audio/rpg/bgm-adventure.wav
  }

  function stopBgm() {
    audioPool.forEach(a => a.stop())
  }

  function toggleMute() {
    muted.value = !muted.value
  }

  return { muted, playSfx, playBgm, stopBgm, toggleMute }
}

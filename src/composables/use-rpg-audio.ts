/**
 * RPG 音效 composable（InnerAudioContext + H5 Web Audio 合成 fallback）
 */
import { computed, ref } from 'vue'
import {
  getRpgSynthSfxPath,
  RPG_AUDIO_STORAGE_KEY,
  RPG_BGM,
  RPG_FILE_SFX,
  RPG_SYNTH_SFX,
} from '@/constants/rpg-audio'
import type { RpgBgmKey, RpgFileSfxKey, RpgSfxKey, RpgSynthSfxKey } from '@/constants/rpg-audio'

interface RpgAudioSettings {
  muted: boolean
  sfxVolume: number
  bgmVolume: number
}

const DEFAULT: RpgAudioSettings = { muted: false, sfxVolume: 0.85, bgmVolume: 0.35 }
const settings = ref<RpgAudioSettings>(readSettings())
let bgmCtx: UniApp.InnerAudioContext | null = null
const audioPool: UniApp.InnerAudioContext[] = []
const MAX_POOL = 8

function readSettings(): RpgAudioSettings {
  try {
    const raw = uni.getStorageSync(RPG_AUDIO_STORAGE_KEY)
    if (!raw)
      return { ...DEFAULT }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      muted: !!parsed.muted,
      sfxVolume: Math.min(1, Math.max(0, parsed.sfxVolume ?? DEFAULT.sfxVolume)),
      bgmVolume: Math.min(1, Math.max(0, parsed.bgmVolume ?? DEFAULT.bgmVolume)),
    }
  }
  catch {
    return { ...DEFAULT }
  }
}

function persist() {
  uni.setStorageSync(RPG_AUDIO_STORAGE_KEY, JSON.stringify(settings.value))
}

function createInnerAudio(): UniApp.InnerAudioContext {
  const ctx = uni.createInnerAudioContext()
  // #ifdef MP-WEIXIN
  ctx.obeyMuteSwitch = false
  // #endif
  return ctx
}

function playInnerAudio(src: string, volume: number, loop = false) {
  const ctx = createInnerAudio()
  ctx.src = src
  ctx.volume = volume
  ctx.loop = loop
  ctx.onEnded(() => ctx.destroy())
  ctx.onError((err) => {
    console.warn('[rpg-audio] play failed', src, err)
    ctx.destroy()
  })
  ctx.play()
  if (!loop) {
    audioPool.push(ctx)
    if (audioPool.length > MAX_POOL)
      audioPool.shift()?.destroy()
  }
  return ctx
}

function playSynthToneH5(key: RpgSynthSfxKey) {
  const base = RPG_SYNTH_SFX[key]?.volume ?? 0.4
  const vol = settings.value.sfxVolume * base
  if (vol <= 0)
    return
  const freqMap: Partial<Record<RpgSynthSfxKey, number>> = {
    uiClick: 880,
    signIn: 660,
    levelUp: 523,
    questReward: 740,
    tabSwitch: 520,
    lotteryCharge: 440,
    lotterySpin: 320,
    lotteryRevealCommon: 520,
    lotteryRevealRare: 620,
    lotteryRevealEpic: 740,
    achievement: 680,
    petHatch: 590,
    rankUp: 700,
    currencyGain: 650,
  }
  // #ifdef H5
  try {
    const audioCtx = new AudioContext()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.frequency.value = freqMap[key] ?? 600
    gain.gain.value = vol * 0.15
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      void audioCtx.close()
    }, 120)
  }
  catch { /* ignore */ }
  // #endif
}

/** 小程序/App：播放预生成 wav；H5 优先 Web Audio */
function playSynthTone(key: RpgSynthSfxKey) {
  const base = RPG_SYNTH_SFX[key]?.volume ?? 0.4
  const vol = settings.value.sfxVolume * base
  if (vol <= 0)
    return
  // #ifdef H5
  playSynthToneH5(key)
  // #endif
  // #ifndef H5
  playInnerAudio(getRpgSynthSfxPath(key), vol)
  // #endif
}

function playFileSfx(key: RpgFileSfxKey) {
  const def = RPG_FILE_SFX[key]
  if (!def)
    return
  playInnerAudio(def.src, settings.value.sfxVolume * (def.volume ?? 0.6))
}

export function useRpgAudio() {
  const muted = computed({
    get: () => settings.value.muted,
    set: (v: boolean) => {
      settings.value.muted = v
      persist()
      if (v)
        stopBgm()
    },
  })

  const sfxVolume = computed({
    get: () => settings.value.sfxVolume,
    set: (v: number) => {
      settings.value.sfxVolume = Math.min(1, Math.max(0, v))
      persist()
    },
  })

  const bgmVolume = computed({
    get: () => settings.value.bgmVolume,
    set: (v: number) => {
      settings.value.bgmVolume = Math.min(1, Math.max(0, v))
      persist()
      if (bgmCtx)
        bgmCtx.volume = settings.value.bgmVolume * (RPG_BGM.adventure.volume ?? 0.18)
    },
  })

  function initAudio() {
    settings.value = readSettings()
  }

  function playSfx(key: RpgSfxKey) {
    if (settings.value.muted)
      return
    if (key in RPG_FILE_SFX)
      playFileSfx(key as RpgFileSfxKey)
    else
      playSynthTone(key as RpgSynthSfxKey)
  }

  function playBgm(key: RpgBgmKey = 'adventure') {
    if (settings.value.muted || settings.value.bgmVolume <= 0)
      return
    const def = RPG_BGM[key]
    if (!def)
      return
    if (!bgmCtx) {
      bgmCtx = createInnerAudio()
      bgmCtx.loop = def.loop ?? true
      bgmCtx.onError((err) => {
        console.warn('[rpg-audio] bgm failed', def.src, err)
      })
    }
    bgmCtx.src = def.src
    bgmCtx.volume = settings.value.bgmVolume * (def.volume ?? 0.18)
    bgmCtx.play()
  }

  function stopBgm() {
    bgmCtx?.stop()
  }

  function toggleMute() {
    muted.value = !muted.value
  }

  return {
    muted,
    sfxVolume,
    bgmVolume,
    initAudio,
    playSfx,
    playBgm,
    stopBgm,
    toggleMute,
  }
}

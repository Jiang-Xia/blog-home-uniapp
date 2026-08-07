/**
 * 生成 RPG 音频 WAV（pages-rpg 分包 static，减小主包体积）
 * - 22050Hz + 12s BGM 循环，体积约为旧版主包音频的 1/3
 * - H5 仍可用 Web Audio，MP/App 走 InnerAudioContext
 * 运行：node scripts/generate-rpg-audio.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** 分包 static，避免主包超 2MB */
const OUT_DIR = path.join(__dirname, '../src/pages-rpg/static/audio/rpg')
/** 旧主包路径，生成后清理 */
const LEGACY_OUT_DIR = path.join(__dirname, '../src/static/audio/rpg')
/** 22050Hz 足够短音效/BGM，体积约为 44100 的一半 */
const SR = 22050

function writeWav(filePath, samples) {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SR, 24)
  buffer.writeUInt32LE(SR * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2)
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, buffer)
}

function adsr(i, len, a = 0.005, d = 0.08, s = 0.6, r = 0.1) {
  const A = Math.floor(SR * a)
  const D = Math.floor(SR * d)
  const R = Math.floor(SR * r)
  const sustainStart = A + D
  const sustainEnd = len - R
  if (i < A)
    return i / A
  if (i < sustainStart)
    return 1 - (1 - s) * ((i - A) / D)
  if (i < sustainEnd)
    return s
  if (i < len)
    return s * ((len - i) / R)
  return 0
}

function osc(freq, t, wave = 'sine') {
  const ph = 2 * Math.PI * freq * t
  if (wave === 'triangle')
    return (2 / Math.PI) * Math.asin(Math.sin(ph))
  if (wave === 'square')
    return Math.sign(Math.sin(ph)) * 0.6
  if (wave === 'saw')
    return 2 * (freq * t - Math.floor(freq * t + 0.5))
  return Math.sin(ph)
}

function buf(sec) {
  return new Float32Array(Math.floor(sec * SR))
}

function mix(...layers) {
  const len = Math.max(...layers.map(l => l.length))
  const out = new Float32Array(len)
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i++)
      out[i] += layer[i]
  }
  return normalize(out, 0.92)
}

function normalize(samples, peak = 0.95) {
  const out = new Float32Array(samples.length)
  let max = 0
  for (const s of samples)
    max = Math.max(max, Math.abs(s))
  if (max < 1e-6)
    return samples
  const g = peak / max
  for (let i = 0; i < samples.length; i++)
    out[i] = samples[i] * g
  return out
}

function place(out, startSec, genFn) {
  const start = Math.floor(startSec * SR)
  const part = genFn()
  for (let i = 0; i < part.length && start + i < out.length; i++)
    out[start + i] += part[i]
}

function note(freq, dur, amp = 0.3, wave = 'sine', env = {}) {
  const len = Math.floor(dur * SR)
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const v = osc(freq, t, wave)
    const harm = wave === 'sine' ? v : v + osc(freq * 2, t, 'sine') * 0.15
    out[i] = harm * amp * adsr(i, len, env.a, env.d, env.s, env.r)
  }
  return out
}

function arp(freqs, stepDur, amp = 0.28, wave = 'triangle') {
  return mix(
    ...freqs.map((f, i) => {
      const b = buf(stepDur * freqs.length)
      place(b, i * stepDur, () => note(f, stepDur * 1.1, amp, wave, { a: 0.002, d: 0.05, s: 0.2, r: 0.04 }))
      return b
    }),
  )
}

function noise(len, amp = 0.2, color = 1) {
  const out = new Float32Array(len)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = last * (1 - color) + white * color
    out[i] = last * amp * adsr(i, len, 0.001, 0.05, 0.4, 0.08)
  }
  return out
}

function coinPing(pitch = 1800, dur = 0.12) {
  const len = Math.floor(dur * SR)
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const ping = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 35)
    const ping2 = Math.sin(2 * Math.PI * pitch * 2.3 * t) * Math.exp(-t * 50) * 0.35
    out[i] = (ping + ping2) * 0.45 * adsr(i, len, 0.001, 0.02, 0.1, 0.06)
  }
  return out
}

function coinClink(startSec, pitch = 1800) {
  const b = buf(startSec + 0.15)
  place(b, startSec, () => coinPing(pitch))
  return b
}

function sparkle(startSec, dur = 0.5, density = 12) {
  const b = buf(dur + 0.1)
  for (let k = 0; k < density; k++) {
    const t0 = startSec + (k / density) * dur
    const f = 1200 + Math.random() * 2400
    place(b, t0, () => note(f, 0.04 + Math.random() * 0.03, 0.08 + Math.random() * 0.06, 'sine', { a: 0.001, d: 0.02, s: 0, r: 0.02 }))
  }
  return b
}

function drumHit(startSec, type = 'kick') {
  const b = buf(0.35)
  place(b, startSec, () => {
    const len = Math.floor(0.25 * SR)
    const out = new Float32Array(len)
    for (let i = 0; i < len; i++) {
      const t = i / SR
      if (type === 'kick')
        out[i] = Math.sin(2 * Math.PI * 120 * Math.exp(-t * 18) * t) * Math.exp(-t * 10) * 0.55
      else
        out[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.35
    }
    return out
  })
  return b
}

function simpleBlip(freq = 660, dur = 0.1) {
  return note(freq, dur, 0.24, 'triangle', { a: 0.002, d: 0.04, s: 0.1, r: 0.05 })
}

function bgmAdventure() {
  /** 12s 循环 BGM，减小分包体积 */
  const dur = 12
  const out = buf(dur)
  const harpSeq = [[293.66, 349.23, 440], [261.63, 329.63, 392], [246.94, 293.66, 369.99], [220, 261.63, 329.63]]
  const step = dur / 16
  for (let bar = 0; bar < 16; bar++) {
    const chord = harpSeq[Math.floor(bar / 4) % 4]
    for (let n = 0; n < 3; n++) {
      place(out, bar * step + n * (step / 4), () =>
        note(chord[n], step / 3.5, 0.14, 'triangle', { a: 0.002, d: 0.12, s: 0, r: 0.08 }))
    }
  }
  const melody = [587.33, 659.25, 587.33, 523.25, 493.88, 523.25, 587.33, 659.25]
  melody.forEach((f, i) => {
    place(out, 1.2 + i * 0.55, () => note(f, 0.42, 0.1, 'sine', { a: 0.01, d: 0.08, s: 0.5, r: 0.12 }))
  })
  ;[146.83, 130.81, 123.47, 110].forEach((f, i) => {
    place(out, i * 5, () => note(f, 4.8, 0.07, 'sine', { a: 0.2, d: 0.3, s: 0.6, r: 0.5 }))
  })
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length
    const fade = t < 0.03 ? t / 0.03 : t > 0.97 ? (1 - t) / 0.03 : 1
    out[i] *= fade
  }
  return normalize(out)
}

const sounds = {
  'bgm-adventure': bgmAdventure(),
  'sfx-uiClick': mix(note(784, 0.05, 0.22, 'square'), note(523.25, 0.04, 0.12, 'triangle')),
  'sfx-lotteryCharge': mix((() => {
    const out = buf(1.4)
    for (let i = 0; i < out.length; i++) {
      const t = i / SR
      out[i] = Math.sin(2 * Math.PI * (55 + t * 30) * t) * (0.08 + t * 0.12) * Math.min(1, t * 2)
    }
    return out
  })(), sparkle(0.25, 1.0, 18)),
  'sfx-lotterySpin': (() => {
    const dur = 2.6
    const out = buf(dur)
    for (let i = 0; i < out.length; i++) {
      const t = i / SR
      const speed = 6 + t * 14
      const tick = Math.sin(2 * Math.PI * speed * t) > 0.85 ? 1 : 0
      out[i] = tick * (0.06 + Math.min(0.08, t * 0.04)) * adsr(i, out.length, 0.02, 0.1, 0.8, 0.08)
    }
    return out
  })(),
  'sfx-lotteryTick': mix(note(180, 0.06, 0.35, 'square'), note(880, 0.08, 0.18, 'sine')),
  'sfx-lotteryRevealCommon': mix(note(659.25, 0.1, 0.25, 'triangle'), coinClink(0.05, 1400)),
  'sfx-lotteryRevealRare': mix(arp([523.25, 659.25, 783.99], 0.09, 0.22, 'triangle'), sparkle(0.15, 0.25, 6)),
  'sfx-lotteryRevealEpic': (() => {
    const out = buf(0.9)
    ;[392, 523.25, 659.25, 783.99].forEach((f, i) => {
      place(out, i * 0.1, () => note(f, 0.22, 0.24, 'saw', { a: 0.005, d: 0.06, s: 0.4, r: 0.1 }))
    })
    return mix(out, drumHit(0, 'kick'), sparkle(0.3, 0.4, 10))
  })(),
  'sfx-lotteryRevealLegendary': (() => {
    const out = buf(1.4)
    ;[523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      place(out, i * 0.11, () => note(f, 0.28, 0.26, 'saw', { a: 0.005, d: 0.05, s: 0.5, r: 0.12 }))
    })
    return mix(out, sparkle(0.5, 0.7, 22))
  })(),
  'sfx-levelUp': (() => {
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]
    const out = buf(1.1)
    scale.forEach((f, i) => {
      place(out, i * 0.07, () => note(f, 0.14, 0.26, 'square', { a: 0.002, d: 0.03, s: 0.3, r: 0.06 }))
    })
    return mix(out, sparkle(0.45, 0.5, 16))
  })(),
  'sfx-achievement': (() => {
    const out = buf(1.0)
    ;[392, 523.25, 659.25].forEach((f, i) => {
      place(out, i * 0.15, () => note(f, 0.35, 0.22, 'saw', { a: 0.02, d: 0.08, s: 0.5, r: 0.15 }))
    })
    return mix(out, sparkle(0.2, 0.6, 12))
  })(),
  'sfx-signIn': mix(arp([523.25, 659.25, 783.99, 1046.5], 0.06, 0.22, 'triangle'), coinClink(0.22, 1500)),
  'sfx-questReward': mix(arp([659.25, 784, 880, 1046.5], 0.08, 0.24, 'square'), coinClink(0.35, 1700)),
  'sfx-tabSwitch': simpleBlip(520, 0.06),
  'sfx-equip': simpleBlip(740, 0.12),
  'sfx-unequip': simpleBlip(480, 0.1),
  'sfx-buffActivate': arp([440, 554, 659], 0.07, 0.2, 'sine'),
  'sfx-buffDeactivate': simpleBlip(330, 0.14),
  'sfx-petDeploy': simpleBlip(590, 0.12),
  'sfx-petRest': simpleBlip(420, 0.1),
  'sfx-petHatch': mix(arp([523.25, 659.25, 784], 0.08, 0.22, 'triangle'), sparkle(0.1, 0.35, 8)),
  'sfx-petBuy': coinClink(0, 1600),
  'sfx-petRename': simpleBlip(680, 0.08),
  'sfx-guildCreate': arp([392, 494, 587], 0.1, 0.22, 'saw'),
  'sfx-guildJoin': simpleBlip(620, 0.11),
  'sfx-guildLeave': simpleBlip(380, 0.11),
  'sfx-rankUp': mix(arp([659.25, 784, 988], 0.09, 0.24, 'square'), drumHit(0, 'kick')),
  'sfx-questComplete': simpleBlip(880, 0.14),
  'sfx-currencyGain': mix(coinClink(0, 1800), coinClink(0.08, 2100)),
  'sfx-banPunish': mix(note(110, 0.2, 0.35, 'saw'), noise(Math.floor(0.06 * SR), 0.25, 0.4)),
  'sfx-socialCheer': arp([784, 988, 1174.66, 1318.51], 0.07, 0.18, 'sine'),
  'sfx-socialFlower': mix(arp([659.25, 830.61, 987.77], 0.06, 0.16, 'triangle'), sparkle(0.1, 0.45, 8)),
  'sfx-socialEgg': mix(noise(Math.floor(0.08 * SR), 0.45, 0.5), note(110, 0.12, 0.35, 'square')),
  'sfx-socialTip': mix(coinClink(0, 1800), coinClink(0.08, 2100), coinClink(0.16, 2400)),
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const [name, samples] of Object.entries(sounds)) {
  const outPath = path.join(OUT_DIR, `${name}.wav`)
  writeWav(outPath, samples)
  const kb = Math.round(fs.statSync(outPath).size / 1024)
  console.log(`wrote ${name}.wav (${kb} KB)`)
}

/** 清理旧主包 wav/mp3，避免 MP 主包超限 */
if (fs.existsSync(LEGACY_OUT_DIR)) {
  for (const f of fs.readdirSync(LEGACY_OUT_DIR))
    fs.unlinkSync(path.join(LEGACY_OUT_DIR, f))
  fs.rmdirSync(LEGACY_OUT_DIR)
  const legacyAudio = path.dirname(LEGACY_OUT_DIR)
  if (fs.existsSync(legacyAudio) && fs.readdirSync(legacyAudio).length === 0)
    fs.rmdirSync(legacyAudio)
  console.log(`removed legacy ${LEGACY_OUT_DIR}`)
}

const totalKb = Math.round(
  fs.readdirSync(OUT_DIR).reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0) / 1024,
)
console.log(`\nGenerated ${Object.keys(sounds).length} wav (${totalKb} KB total) → ${OUT_DIR}`)

<!--
  音频可视化 — H5 使用 Web Audio API 绘制频谱/波形；MP 使用 InnerAudioContext + 装饰柱动画。
  示例音频来自站点静态资源。
-->
<script lang="ts" setup>
import { getCurrentInstance } from 'vue'

definePage({
  style: { navigationBarTitleText: '音频可视化' },
})

const DEMO_MP3_SRC = 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2024-03/eqiic4bsyyu39pd95y7eh9-江南-林俊杰.128.mp3'

type VizMode = 'frequency' | 'waveform'
type ColorTheme = 'cyber' | 'neon' | 'sunset' | 'frost'

interface ThemePalette {
  low: string
  high: string
  stroke: string
  bg: string
}

const COLOR_THEMES: Record<ColorTheme, ThemePalette> = {
  cyber: { low: 'rgb(80, 50, 220)', high: 'rgb(180, 120, 255)', stroke: 'rgb(140, 100, 255)', bg: 'rgba(0, 0, 0, 0.15)' },
  neon: { low: 'rgb(0, 180, 120)', high: 'rgb(80, 255, 220)', stroke: 'rgb(60, 230, 180)', bg: 'rgba(0, 0, 0, 0.2)' },
  sunset: { low: 'rgb(220, 80, 40)', high: 'rgb(255, 180, 80)', stroke: 'rgb(255, 140, 60)', bg: 'rgba(30, 10, 0, 0.2)' },
  frost: { low: 'rgb(60, 120, 220)', high: 'rgb(200, 230, 255)', stroke: 'rgb(160, 200, 255)', bg: 'rgba(0, 20, 40, 0.2)' },
}

const themeOptions = [
  { value: 'cyber', label: '赛博紫' },
  { value: 'neon', label: '霓虹绿' },
  { value: 'sunset', label: '落日橙' },
  { value: 'frost', label: '冰霜蓝' },
] as const

const audioSrc = ref(DEMO_MP3_SRC)
const audioKey = ref(0)
const vizMode = ref<VizMode>('frequency')
const colorTheme = ref<ColorTheme>('cyber')
const themeIndex = ref(0)
const gain = ref(1.5)
const smoothing = ref(0.85)
const isPlaying = ref(false)
const loadError = ref(false)
const mpDecorative = ref(false)
const canvasHeight = ref(240)

watch(themeIndex, (i) => {
  colorTheme.value = themeOptions[i]?.value ?? 'cyber'
})

const hintText = computed(() => {
  if (loadError.value)
    return '音频加载失败，请检查网络或换用本地文件。'
  // #ifndef H5
  if (mpDecorative.value)
    return '小程序端无 Web Audio，当前为播放态装饰动画（非真实频谱）。'
  // #endif
  if (!isPlaying.value)
    return '点击播放按钮开始可视化。'
  return ''
})

// #ifdef H5
const canvasWrapRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const audioHostRef = ref<HTMLElement>()
const audioRef = ref<HTMLAudioElement>()

let objectUrl: string | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let freqData: Uint8Array | null = null
let timeData: Uint8Array | null = null
let rafId = 0
let resizeObserver: ResizeObserver | null = null

function currentPalette(): ThemePalette {
  return COLOR_THEMES[colorTheme.value]
}

function teardownAudioGraph() {
  cancelAnimationFrame(rafId)
  rafId = 0
  analyser = null
  freqData = null
  timeData = null
  if (audioCtx) {
    void audioCtx.close()
    audioCtx = null
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  isPlaying.value = false
}

function resizeCanvas() {
  const wrap = canvasWrapRef.value
  const canvas = canvasRef.value
  if (!wrap || !canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  const dpr = window.devicePixelRatio || 1
  const width = wrap.clientWidth
  const height = canvasHeight.value
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function applySmoothing() {
  if (analyser)
    analyser.smoothingTimeConstant = smoothing.value
}

async function ensureAnalyser(audioEl: HTMLAudioElement) {
  if (analyser && audioCtx) {
    if (audioCtx.state === 'suspended')
      await audioCtx.resume()
    return
  }
  audioCtx = new AudioContext()
  const source = audioCtx.createMediaElementSource(audioEl)
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = smoothing.value
  freqData = new Uint8Array(analyser.frequencyBinCount)
  timeData = new Uint8Array(analyser.fftSize)
  source.connect(analyser)
  analyser.connect(audioCtx.destination)
  if (audioCtx.state === 'suspended')
    await audioCtx.resume()
}

function drawFrequency(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!analyser || !freqData)
    return
  const palette = currentPalette()
  analyser.getByteFrequencyData(freqData)
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, width, height)
  const barCount = 96
  const step = Math.floor(freqData.length / barCount)
  const gap = 2
  const barWidth = (width - gap * (barCount - 1)) / barCount
  for (let i = 0; i < barCount; i++) {
    const raw = (freqData[i * step] ?? 0) / 255
    const value = Math.min(1, raw * gain.value)
    const barHeight = value * height * 0.9
    const x = i * (barWidth + gap)
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
    gradient.addColorStop(0, palette.low)
    gradient.addColorStop(1, palette.high)
    ctx.fillStyle = gradient
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    ctx.fillRect(x, 0, barWidth, barHeight * 0.35)
  }
}

function drawWaveform(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!analyser || !timeData)
    return
  const palette = currentPalette()
  analyser.getByteTimeDomainData(timeData)
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, width, height)
  const midY = height / 2
  const amplitude = (height / 2) * Math.min(1, gain.value / 1.5)
  ctx.lineWidth = 2
  ctx.strokeStyle = palette.stroke
  ctx.beginPath()
  const sliceWidth = width / timeData.length
  let x = 0
  for (let i = 0; i < timeData.length; i++) {
    const v = ((timeData[i] ?? 128) - 128) / 128
    const y = midY + v * amplitude
    if (i === 0)
      ctx.moveTo(x, y)
    else
      ctx.lineTo(x, y)
    x += sliceWidth
  }
  ctx.stroke()
}

function drawFrame() {
  const canvas = canvasRef.value
  if (!canvas || !isPlaying.value)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  const dpr = window.devicePixelRatio || 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr
  if (vizMode.value === 'frequency')
    drawFrequency(ctx, width, height)
  else
    drawWaveform(ctx, width, height)
  rafId = requestAnimationFrame(drawFrame)
}

async function onPlay() {
  const audioEl = audioRef.value
  if (!audioEl)
    return
  loadError.value = false
  try {
    await ensureAnalyser(audioEl)
    isPlaying.value = true
    cancelAnimationFrame(rafId)
    drawFrame()
  }
  catch {
    loadError.value = true
    isPlaying.value = false
  }
}

function onPause() {
  isPlaying.value = false
  cancelAnimationFrame(rafId)
  rafId = 0
}

function onFilePickH5() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file)
      return
    teardownAudioGraph()
    if (objectUrl)
      URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(file)
    audioSrc.value = objectUrl
    audioKey.value += 1
    loadError.value = false
  }
  input.click()
}

function resetToDemo() {
  teardownAudioGraph()
  audioSrc.value = DEMO_MP3_SRC
  audioKey.value += 1
  loadError.value = false
}

function mountH5Audio() {
  const host = audioHostRef.value
  if (!host)
    return
  host.innerHTML = ''
  const el = document.createElement('audio')
  el.controls = true
  el.className = 'w-full'
  el.src = audioSrc.value
  el.addEventListener('play', () => void onPlay())
  el.addEventListener('pause', onPause)
  el.addEventListener('ended', onPause)
  el.addEventListener('error', () => {
    loadError.value = true
  })
  host.appendChild(el)
  audioRef.value = el
}

watch([audioSrc, audioKey], () => {
  nextTick(() => mountH5Audio())
})

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => resizeCanvas())
  if (canvasWrapRef.value)
    resizeObserver.observe(canvasWrapRef.value)
  mountH5Audio()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  teardownAudioGraph()
})
// #endif

// #ifndef H5
let innerAudio: UniApp.InnerAudioContext | null = null
let mpRafId = 0
let mpTick = 0

function teardownMpAudio() {
  if (mpRafId) {
    cancelAnimationFrame(mpRafId)
    mpRafId = 0
  }
  if (innerAudio) {
    innerAudio.stop()
    innerAudio.destroy()
    innerAudio = null
  }
  isPlaying.value = false
  mpDecorative.value = false
}

function initMpAudio() {
  teardownMpAudio()
  innerAudio = uni.createInnerAudioContext()
  innerAudio.src = audioSrc.value
  innerAudio.onPlay(() => {
    isPlaying.value = true
    mpDecorative.value = true
    drawMpDecorative()
  })
  innerAudio.onPause(() => {
    isPlaying.value = false
    if (mpRafId)
      cancelAnimationFrame(mpRafId)
  })
  innerAudio.onStop(() => {
    isPlaying.value = false
    if (mpRafId)
      cancelAnimationFrame(mpRafId)
  })
  innerAudio.onError(() => {
    loadError.value = true
    isPlaying.value = false
  })
}

function drawMpDecorative() {
  uni.createSelectorQuery()
    .in(getCurrentInstance())
    .select('#audio-viz-canvas')
    .fields({ node: true, size: true }, (res) => {
      const nodeInfo = Array.isArray(res) ? res[0] : res
      const canvas = (nodeInfo as { node?: any })?.node
      if (!canvas || !isPlaying.value)
        return
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      const width = nodeInfo?.width ?? 300
      const height = canvasHeight.value
      canvas.width = width
      canvas.height = height
      const palette = COLOR_THEMES[colorTheme.value]
      ctx.fillStyle = palette.bg
      ctx.fillRect(0, 0, width, height)
      mpTick += 0.12
      const barCount = 48
      const gap = 2
      const barWidth = (width - gap * (barCount - 1)) / barCount
      for (let i = 0; i < barCount; i++) {
        const wave = Math.abs(Math.sin(mpTick + i * 0.35)) * gain.value * 0.5
        const barHeight = Math.min(height * 0.85, wave * height)
        const x = i * (barWidth + gap)
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
        gradient.addColorStop(0, palette.low)
        gradient.addColorStop(1, palette.high)
        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      }
      mpRafId = requestAnimationFrame(drawMpDecorative)
    })
    .exec()
}

function toggleMpPlay() {
  if (!innerAudio)
    initMpAudio()
  if (isPlaying.value)
    innerAudio?.pause()
  else
    innerAudio?.play()
}

function pickAudioMp() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['mp3', 'wav', 'm4a', 'aac'],
    success: (res) => {
      const file = res.tempFiles[0]
      if (!file)
        return
      teardownMpAudio()
      audioSrc.value = file.path
      audioKey.value += 1
      initMpAudio()
      loadError.value = false
    },
  })
}

function resetToDemoMp() {
  teardownMpAudio()
  audioSrc.value = DEMO_MP3_SRC
  audioKey.value += 1
  initMpAudio()
  loadError.value = false
}

onMounted(() => {
  initMpAudio()
})

onBeforeUnmount(() => {
  teardownMpAudio()
})
// #endif
</script>

<template>
  <scroll-view scroll-y class="audio-viz-page cyber-page-grid u-page-scroll u-page-body py-4">
    <tool-card title="音频可视化" desc="播放本地或示例音频，实时展示频谱与波形">
      <view class="u-gap-2 flex flex-wrap">
        <!-- #ifdef H5 -->
        <wd-button size="small" @click="onFilePickH5">
          选择音频
        </wd-button>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <wd-button size="small" @click="pickAudioMp">
          选择音频
        </wd-button>
        <wd-button size="small" @click="toggleMpPlay">
          {{ isPlaying ? '暂停' : '播放' }}
        </wd-button>
        <!-- #endif -->
        <view class="u-gap-2 flex flex-wrap">
          <wd-button size="small" :type="vizMode === 'frequency' ? 'primary' : undefined" @click="vizMode = 'frequency'">
            频谱柱
          </wd-button>
          <wd-button size="small" :type="vizMode === 'waveform' ? 'primary' : undefined" @click="vizMode = 'waveform'">
            波形
          </wd-button>
        </view>
        <picker :range="themeOptions.map(t => t.label)" :value="themeIndex" @change="themeIndex = Number(($event as any).detail.value)">
          <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
            {{ themeOptions[themeIndex]?.label }}
          </view>
        </picker>
        <!-- #ifdef H5 -->
        <wd-button v-if="audioSrc !== DEMO_MP3_SRC" size="small" @click="resetToDemo">
          恢复示例
        </wd-button>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <wd-button v-if="audioSrc !== DEMO_MP3_SRC" size="small" @click="resetToDemoMp">
          恢复示例
        </wd-button>
        <!-- #endif -->
      </view>

      <view class="mt-3">
        <view class="mb-1 flex justify-between text-xs text-tech-muted">
          <text>灵敏度</text>
          <text>{{ gain.toFixed(1) }}×</text>
        </view>
        <slider :value="gain" :min="0.5" :max="3" :step="0.1" active-color="var(--cyber-primary)" @change="gain = ($event as any).detail.value" />
      </view>
      <!-- #ifdef H5 -->
      <view class="mt-3">
        <view class="mb-1 flex justify-between text-xs text-tech-muted">
          <text>平滑</text>
          <text>{{ smoothing.toFixed(2) }}</text>
        </view>
        <slider :value="smoothing" :min="0" :max="0.95" :step="0.05" active-color="var(--cyber-primary)" @change="smoothing = ($event as any).detail.value; applySmoothing()" />
      </view>
      <view ref="audioHostRef" class="mt-3 w-full" />
      <!-- #endif -->

      <text v-if="hintText" class="mt-2 block text-sm text-tech-muted">{{ hintText }}</text>

      <!-- #ifdef H5 -->
      <view ref="canvasWrapRef" class="viz-wrap mt-4 overflow-hidden border border-tech rounded-lg" :style="{ height: `${canvasHeight}px` }">
        <canvas ref="canvasRef" class="block h-full w-full" />
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="viz-wrap mt-4 overflow-hidden border border-tech rounded-lg" :style="{ height: `${canvasHeight}px` }">
        <canvas id="audio-viz-canvas" type="2d" class="block h-full w-full" />
      </view>
      <!-- #endif -->
    </tool-card>
  </scroll-view>
</template>

<style lang="scss" scoped>
.cyber-input-like {
  background: var(--tech-input-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
}
.viz-wrap {
  background: var(--tech-input-bg, rgba(0, 0, 0, 0.2));
}
</style>

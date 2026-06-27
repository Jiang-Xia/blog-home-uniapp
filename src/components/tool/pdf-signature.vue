<!--
  PDF 预览 + 电子签名 — pdf.js 渲染页面、手写板采集笔迹、pdf-lib 合成签名与日期。
  父组件传入 pdf-src；签名完成后 emit success(ArrayBuffer | Blob)。
-->
<script lang="ts" setup>
import dayjs from 'dayjs'
import { resolveStaticUrl } from '@/utils/static-url'

const props = withDefaults(defineProps<{
  pdfSrc: string
  /** 阅读倒计时秒数 */
  second?: number
}>(), {
  second: 10,
})

const emit = defineEmits<{
  success: [blob: Blob]
}>()

const localSecond = ref(props.second)
const showSignature = ref(false)
const loading = ref(true)
const loadError = ref('')
const signing = ref(false)
const totalPageCount = ref(1)
const currentPage = ref(1)
const scaleFactor = ref(1)
const minScale = ref(1)

const scrollTop = ref(0)
const pdfPageImages = ref<string[]>([])

const sigCanvasW = ref(400)
const sigCanvasH = ref(180)
const strokes = ref<{ x: number, y: number }[][]>([])
let currentStroke: { x: number, y: number }[] = []
let drawing = false

const pdfSourceBuffer = ref<ArrayBuffer | null>(null)
let countdownTimer: ReturnType<typeof setInterval> | null = null

/** 印章图（可选，加载失败时跳过） */
const SEAL_URL = resolveStaticUrl('/images/logo/person/jiang.png')

async function fetchPdfBuffer(src: string): Promise<ArrayBuffer> {
  // #ifdef H5
  const res = await fetch(src)
  if (!res.ok)
    throw new Error(`PDF 加载失败（HTTP ${res.status}）`)
  return res.arrayBuffer()
  // #endif
  // #ifndef H5
  return new Promise((resolve, reject) => {
    uni.request({
      url: src,
      responseType: 'arraybuffer',
      success: (r) => {
        if (r.statusCode && r.statusCode >= 400)
          reject(new Error(`HTTP ${r.statusCode}`))
        else
          resolve(r.data as ArrayBuffer)
      },
      fail: reject,
    })
  })
  // #endif
}

/** pdf.js 仅 H5 按需加载；小程序端不引入 pdfjs-dist，避免主包 vendor 与微信 ES5 转译冲突 */
async function loadPdfJs() {
  // #ifdef H5
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href
  return pdfjs
  // #endif
}

/** 渲染 PDF 各页为预览图（H5 canvas / MP 暂用占位） */
async function reloadPdf(src = props.pdfSrc) {
  if (!src) {
    loadError.value = '未指定 PDF 文件'
    loading.value = false
    return
  }
  loading.value = true
  loadError.value = ''
  pdfPageImages.value = []

  try {
    const buffer = await fetchPdfBuffer(src)
    pdfSourceBuffer.value = buffer.slice(0)

    // #ifdef H5
    const pdfjs = await loadPdfJs()
    const pdfDocument = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
    totalPageCount.value = pdfDocument.numPages
    currentPage.value = 1
    const images: string[] = []
    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx)
        throw new Error('Canvas 不可用')
      await page.render({ canvasContext: ctx, viewport, canvas }).promise
      images.push(canvas.toDataURL('image/png'))
    }
    minScale.value = 0.8
    scaleFactor.value = 1
    pdfPageImages.value = images
    // #endif

    // #ifndef H5
    totalPageCount.value = 1
    currentPage.value = 1
    pdfPageImages.value = ['']
    // #endif
  }
  catch (err) {
    console.error('[pdf-signature] PDF 渲染失败:', err)
    loadError.value = err instanceof Error ? err.message : 'PDF 加载失败'
  }
  finally {
    loading.value = false
  }
}

function changeScale(direction: '+' | '-') {
  let num = scaleFactor.value
  if (direction === '-')
    num = Math.max(minScale.value, num - num * 0.1)
  else
    num = Math.min(minScale.value * 4, num + num * 0.1)
  scaleFactor.value = num
}

function onScroll(e: { detail: { scrollTop: number } }) {
  scrollTop.value = e.detail.scrollTop
  const approxPageH = 792 * scaleFactor.value
  if (approxPageH > 0)
    currentPage.value = Math.min(totalPageCount.value, Math.max(1, Math.ceil((scrollTop.value + 80) / approxPageH)))
}

function startCountdown() {
  localSecond.value = props.second
  if (countdownTimer)
    clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    if (localSecond.value > 0) {
      localSecond.value -= 1
    }
    else if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

function openSignature() {
  strokes.value = []
  currentStroke = []
  showSignature.value = true
  nextTick(() => redrawSignature())
}

function getSigPoint(e: any, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  if ('touches' in e && e.touches[0]) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    }
  }
  if ('clientX' in e) {
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  return null
}

function redrawSignature() {
  // #ifdef H5
  const canvas = document.getElementById('pdf-sig-canvas') as HTMLCanvasElement | null
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of strokes.value) {
    if (stroke.length < 2)
      continue
    ctx.beginPath()
    ctx.moveTo(stroke[0]!.x, stroke[0]!.y)
    for (let i = 1; i < stroke.length; i++)
      ctx.lineTo(stroke[i]!.x, stroke[i]!.y)
    ctx.stroke()
  }
  // #endif
}

function onSigStart(e: any) {
  // #ifdef H5
  const canvas = document.getElementById('pdf-sig-canvas') as HTMLCanvasElement | null
  if (!canvas)
    return
  const pt = getSigPoint(e, canvas)
  if (!pt)
    return
  drawing = true
  currentStroke = [pt]
  // #endif
}

function onSigMove(e: any) {
  if (!drawing)
    return
  // #ifdef H5
  const canvas = document.getElementById('pdf-sig-canvas') as HTMLCanvasElement | null
  if (!canvas)
    return
  const pt = getSigPoint(e, canvas)
  if (!pt)
    return
  currentStroke.push(pt)
  redrawSignature()
  // #endif
}

function onSigEnd() {
  if (!drawing)
    return
  drawing = false
  if (currentStroke.length)
    strokes.value.push([...currentStroke])
  currentStroke = []
}

function clearSignature() {
  strokes.value = []
  currentStroke = []
  redrawSignature()
}

function undoSignature() {
  strokes.value.pop()
  redrawSignature()
}

function isSignatureEmpty() {
  return strokes.value.length === 0
}

function signatureToPngDataUrl(): string {
  // #ifdef H5
  const canvas = document.getElementById('pdf-sig-canvas') as HTMLCanvasElement
  return canvas.toDataURL('image/png')
  // #endif
  return ''
}

async function editPdf() {
  // #ifndef H5
  uni.showToast({ title: 'PDF 签名请在 H5 浏览器完成', icon: 'none' })
  return
  // #endif
  // #ifdef H5
  if (!pdfSourceBuffer.value) {
    uni.showToast({ title: 'PDF 尚未加载', icon: 'none' })
    return
  }
  signing.value = true
  try {
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.load(pdfSourceBuffer.value.slice(0))
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]!
    const width = lastPage.getWidth()
    const height = lastPage.getHeight()
    const x = width - 260
    const y = height / 2 - 100

    const sigPng = signatureToPngDataUrl()
    const sigBytes = await fetch(sigPng).then(r => r.arrayBuffer())
    const sigImg = await pdfDoc.embedPng(sigBytes)
    lastPage.drawImage(sigImg, { x, y, width: 160, height: 60 })

    try {
      const sealBytes = await fetch(SEAL_URL).then(r => r.arrayBuffer())
      const sealImg = await pdfDoc.embedPng(sealBytes)
      lastPage.drawImage(sealImg, { x, y: y - 40, width: 140, height: 140, opacity: 1 })
    }
    catch {
      // 印章资源缺失时仅写入手写签名
    }

    lastPage.drawText(dayjs().format('YYYY MM DD'), { x: x + 20, y: y - 20, size: 18 })

    const pdfBytes = await pdfDoc.save()
    pdfSourceBuffer.value = pdfBytes.slice().buffer
    await reloadPdfFromBuffer(pdfBytes)
    emit('success', new Blob([pdfBytes], { type: 'application/pdf' }))
  }
  catch (err) {
    console.error('[pdf-signature] 合成失败:', err)
    uni.showToast({ title: '签名写入失败', icon: 'none' })
  }
  finally {
    signing.value = false
  }
  // #endif
}

async function reloadPdfFromBuffer(bytes: Uint8Array) {
  // #ifdef H5
  const pdfjs = await loadPdfJs()
  const pdfDocument = await pdfjs.getDocument({ data: bytes }).promise
  totalPageCount.value = pdfDocument.numPages
  const images: string[] = []
  for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
    const page = await pdfDocument.getPage(pageIndex)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    images.push(canvas.toDataURL('image/png'))
  }
  pdfPageImages.value = images
  // #endif
}

async function finishSignature() {
  if (isSignatureEmpty()) {
    uni.showToast({ title: '请先手写签名', icon: 'none' })
    return
  }
  showSignature.value = false
  await editPdf()
}

watch(() => props.pdfSrc, (src) => {
  if (src) {
    startCountdown()
    showSignature.value = false
    void reloadPdf(src)
  }
})

onMounted(() => {
  startCountdown()
  // #ifdef H5
  sigCanvasW.value = Math.min(480, uni.getSystemInfoSync().windowWidth - 48)
  // #endif
  void reloadPdf()
})

onBeforeUnmount(() => {
  if (countdownTimer)
    clearInterval(countdownTimer)
})
</script>

<template>
  <view class="pdf-signature u-stack-4 flex flex-col">
    <view class="pdf-viewer overflow-hidden border border-tech rounded-lg">
      <view class="viewer-toolbar flex flex-wrap items-center justify-between border-b border-tech px-3 py-2">
        <text class="text-sm text-tech-muted">{{ currentPage }} / {{ totalPageCount }}</text>
        <view class="u-gap-2 flex">
          <wd-button size="small" :disabled="loading" @click="changeScale('-')">
            缩小
          </wd-button>
          <wd-button size="small" :disabled="loading" @click="changeScale('+')">
            放大
          </wd-button>
        </view>
      </view>

      <scroll-view scroll-y class="pdf-scroll" @scroll="onScroll">
        <view v-if="loading" class="min-h-64 flex flex-col items-center justify-center py-16">
          <text class="text-sm text-tech-muted">正在加载 PDF…</text>
        </view>
        <view v-else-if="loadError" class="min-h-64 flex flex-col items-center justify-center px-4 py-16 text-center">
          <text class="text-error text-sm">{{ loadError }}</text>
          <text class="mt-2 text-xs text-tech-subtle">可尝试上传本地 PDF，或确认静态资源可访问。</text>
        </view>
        <view v-else class="pdf-pages mx-auto py-4" :style="{ transform: `scale(${scaleFactor})`, transformOrigin: 'top center' }">
          <!-- #ifdef H5 -->
          <image
            v-for="(img, idx) in pdfPageImages"
            :key="idx"
            :src="img"
            mode="widthFix"
            class="pdf-page-img mb-3 block w-full"
          />
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <text class="block px-4 text-sm text-tech-muted">
            已加载 {{ totalPageCount }} 页 PDF。完整预览请在 H5 打开；签名与下载仍可用。
          </text>
          <!-- #endif -->
        </view>
      </scroll-view>
    </view>

    <view v-if="showSignature" class="signature-panel border border-tech rounded-lg p-3">
      <view class="u-gap-2 mb-3 flex flex-wrap justify-center">
        <wd-button size="small" @click="clearSignature">
          清除
        </wd-button>
        <wd-button size="small" @click="undoSignature">
          上一步
        </wd-button>
        <wd-button size="small" type="primary" :loading="signing" @click="finishSignature">
          完成签名
        </wd-button>
        <wd-button size="small" @click="showSignature = false">
          关闭
        </wd-button>
      </view>
      <!-- #ifdef H5 -->
      <view class="flex justify-center">
        <canvas
          id="pdf-sig-canvas"
          class="signature-canvas"
          :width="sigCanvasW"
          :height="sigCanvasH"
          @mousedown="onSigStart"
          @mousemove="onSigMove"
          @mouseup="onSigEnd"
          @mouseleave="onSigEnd"
          @touchstart.prevent="onSigStart"
          @touchmove.prevent="onSigMove"
          @touchend="onSigEnd"
        />
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <text class="block text-center text-sm text-tech-muted">手写签名请在 H5 浏览器完成。</text>
      <!-- #endif -->
      <text class="mt-2 block text-center text-xs text-tech-subtle">在虚线框内手写签名</text>
    </view>

    <view v-else class="agree-bar border border-tech rounded-lg px-4 py-5">
      <view v-if="localSecond > 0" class="u-stack-2">
        <view class="flex justify-between text-sm text-tech-muted">
          <text>阅读确认</text>
          <text>{{ localSecond }}s</text>
        </view>
        <progress :percent="((second - localSecond) / second) * 100" active-color="var(--cyber-primary)" />
        <text class="text-xs text-tech-subtle">请完整阅读文档后再签名</text>
      </view>
      <view v-else class="flex flex-col items-center">
        <text class="mb-3 text-sm text-tech-muted">已完成阅读，可以开始手写签名</text>
        <wd-button type="primary" :disabled="!!loadError || loading" @click="openSignature">
          开始签名
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pdf-scroll {
  max-height: 65vh;
}
.pdf-page-img {
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.signature-canvas {
  display: block;
  max-width: 100%;
  border-radius: 12px;
  border: 2px dashed var(--tech-border, rgba(255, 255, 255, 0.2));
  background: var(--tech-input-bg, rgba(255, 255, 255, 0.04));
}
.text-error {
  color: #f87171;
}
</style>

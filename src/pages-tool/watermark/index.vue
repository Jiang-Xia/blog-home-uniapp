<!--
  批量图片水印 — 本地选图后在 Canvas 绘制文字水印，支持预览、大图查看与导出。
  H5：file input + ZIP 下载；MP：chooseMedia + 保存到相册。
-->
<script lang="ts" setup>
import JSZip from 'jszip'
import { getCurrentInstance } from 'vue'
import { debounce } from '@/utils/debounce'
import {
  drawWatermarkLayer,
  encodeCanvasDataUrl,

  getExportExtension,
  MAX_WATERMARK_PHOTOS,
  sanitizeFileName,

  WATERMARK_FONT_OPTIONS,

} from '@/utils/tool/watermark-renderer'
import type { ExportFormat, ExportOptions, FontSizeMode, TimeMark, WatermarkColorMode, WatermarkFontKey, WatermarkItem, WatermarkPosition, WatermarkStyle } from '@/utils/tool/watermark-renderer'

definePage({
  style: { navigationBarTitleText: '批量水印' },
})

const customMark = ref('我的水印')
const timeMark = ref<TimeMark>('yes')
const watermarkPosition = ref<WatermarkPosition>('bottom')
const watermarkOpacity = ref(85)
const fontSizeMode = ref<FontSizeMode>('auto')
const customFontSize = ref(30)
const watermarkColorMode = ref<WatermarkColorMode>('white')
const customWatermarkColor = ref('#ffffff')
const watermarkRotation = ref(0)
const watermarkFont = ref<WatermarkFontKey>('harmony')
const appendMode = ref(false)
const exportFormat = ref<ExportFormat>('png')
const jpegQuality = ref(90)

const items = ref<WatermarkItem[]>([])
const loading = ref(false)
const processing = ref(false)
const processedCount = ref(0)
const pendingCount = ref(0)
const downloadingId = ref('')

const positionOptions = [
  { value: 'bottom', label: '底部居中' },
  { value: 'top', label: '顶部居中' },
  { value: 'center', label: '正中央' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'bottom-right', label: '右下角' },
  { value: 'tile', label: '平铺斜纹' },
] as const

const positionIndex = ref(0)
const timeMarkIndex = ref(1)
const fontIndex = ref(0)
const fontSizeModeIndex = ref(0)
const colorModeIndex = ref(0)
const exportFormatIndex = ref(0)

const timeMarkOptions = ['无时间水印', '有时间水印']
const fontSizeModeOptions = ['自适应', '固定']
const colorModeOptions = ['白色', '黑色', '自定义']
const exportFormatOptions = ['PNG（无损）', 'JPEG（体积更小）']

watch(positionIndex, (i) => {
  watermarkPosition.value = positionOptions[i]?.value ?? 'bottom'
})
watch(timeMarkIndex, (i) => {
  timeMark.value = i === 1 ? 'yes' : 'no'
})
watch(fontIndex, (i) => {
  watermarkFont.value = WATERMARK_FONT_OPTIONS[i]?.value ?? 'harmony'
})
watch(fontSizeModeIndex, (i) => {
  fontSizeMode.value = i === 1 ? 'manual' : 'auto'
})
watch(colorModeIndex, (i) => {
  const modes: WatermarkColorMode[] = ['white', 'black', 'custom']
  watermarkColorMode.value = modes[i] ?? 'white'
})
watch(exportFormatIndex, (i) => {
  exportFormat.value = i === 1 ? 'jpeg' : 'png'
})

watch(watermarkColorMode, (mode) => {
  if (mode === 'white')
    customWatermarkColor.value = '#ffffff'
  else if (mode === 'black')
    customWatermarkColor.value = '#000000'
})

function getWatermarkStyle(): WatermarkStyle {
  return {
    position: watermarkPosition.value,
    opacity: watermarkOpacity.value,
    fontSizeMode: fontSizeMode.value,
    customFontSize: customFontSize.value,
    colorMode: watermarkColorMode.value,
    customColor: customWatermarkColor.value,
    rotation: watermarkRotation.value,
    fontFamily: watermarkFont.value,
  }
}

function getExportOptions(): ExportOptions {
  return { format: exportFormat.value, jpegQuality: jpegQuality.value }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

/** H5：FileReader 转 data URL */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

/** H5：离屏 Canvas 渲染水印预览/导出 */
async function renderWatermarkedCanvasH5(src: string, style = getWatermarkStyle()): Promise<HTMLCanvasElement> {
  const img = await loadHtmlImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('canvas unsupported')
  ctx.drawImage(img, 0, 0)
  drawWatermarkLayer(ctx, canvas.width, canvas.height, style, customMark.value, timeMark.value)
  return canvas
}

async function renderWatermarkedImageH5(
  src: string,
  style = getWatermarkStyle(),
  exportOptions = getExportOptions(),
): Promise<string> {
  const canvas = await renderWatermarkedCanvasH5(src, style)
  return encodeCanvasDataUrl(canvas, exportOptions, canvas.width, canvas.height)
}

/** MP：type=2d 隐藏 canvas 渲染 */
async function renderWatermarkedImageMp(
  src: string,
  style = getWatermarkStyle(),
  exportOptions = getExportOptions(),
): Promise<string> {
  const info = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
    uni.getImageInfo({ src, success: resolve, fail: reject })
  })
  return new Promise((resolve, reject) => {
    uni.createSelectorQuery()
      .in(getCurrentInstance())
      .select('#wm-export-canvas')
      .fields({ node: true, size: true }, async (res) => {
        const nodeInfo = Array.isArray(res) ? res[0] : res
        const canvas = (nodeInfo as { node?: any })?.node
        if (!canvas) {
          reject(new Error('canvas node missing'))
          return
        }
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        canvas.width = info.width
        canvas.height = info.height
        const img = canvas.createImage()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, info.width, info.height)
          drawWatermarkLayer(ctx, info.width, info.height, style, customMark.value, timeMark.value)
          uni.canvasToTempFilePath({
            canvas,
            width: info.width,
            height: info.height,
            destWidth: info.width,
            destHeight: info.height,
            fileType: exportOptions.format === 'jpeg' ? 'jpg' : 'png',
            quality: exportOptions.format === 'jpeg' ? exportOptions.jpegQuality / 100 : 1,
            success: r => resolve(r.tempFilePath),
            fail: reject,
          } as UniNamespace.CanvasToTempFilePathOptions, getCurrentInstance())
        }
        img.onerror = () => reject(new Error('image load failed'))
        img.src = src
      })
      .exec()
  })
}

async function renderWatermarkedImage(
  src: string,
  style = getWatermarkStyle(),
  exportOptions = getExportOptions(),
): Promise<string> {
  // #ifdef H5
  return renderWatermarkedImageH5(src, style, exportOptions)
  // #endif
  // #ifndef H5
  return renderWatermarkedImageMp(src, style, exportOptions)
  // #endif
}

async function getExportPath(item: WatermarkItem): Promise<string> {
  return renderWatermarkedImage(item.originalSrc, getWatermarkStyle(), getExportOptions())
}

async function processPaths(paths: { path: string, name: string }[]) {
  const remain = appendMode.value ? MAX_WATERMARK_PHOTOS - items.value.length : MAX_WATERMARK_PHOTOS
  if (remain <= 0) {
    uni.showToast({ title: `最多 ${MAX_WATERMARK_PHOTOS} 张`, icon: 'none' })
    return
  }
  const toAdd = paths.slice(0, remain)
  if (paths.length > remain)
    uni.showToast({ title: `最多 ${MAX_WATERMARK_PHOTOS} 张，已添加 ${toAdd.length} 张`, icon: 'none' })

  if (!appendMode.value)
    items.value = []

  processing.value = true
  processedCount.value = 0
  pendingCount.value = toAdd.length
  const style = getWatermarkStyle()

  try {
    for (const file of toAdd) {
      const originalSrc = file.path
      const previewSrc = await renderWatermarkedImage(originalSrc, style)
      const baseName = file.name.replace(/\.[^.]+$/, '') || `image-${items.value.length + 1}`
      items.value.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: sanitizeFileName(baseName),
        originalSrc,
        previewSrc,
      })
      processedCount.value += 1
    }
  }
  catch {
    uni.showToast({ title: '图片处理失败', icon: 'none' })
    if (!appendMode.value)
      items.value = []
  }
  finally {
    processing.value = false
    processedCount.value = 0
    pendingCount.value = 0
  }
}

/** MP：chooseMedia 多选 */
function pickImagesMp() {
  const remain = appendMode.value ? MAX_WATERMARK_PHOTOS - items.value.length : MAX_WATERMARK_PHOTOS
  if (remain <= 0) {
    uni.showToast({ title: `最多 ${MAX_WATERMARK_PHOTOS} 张`, icon: 'none' })
    return
  }
  uni.chooseMedia({
    count: Math.min(remain, 9),
    mediaType: ['image'],
    success: (res) => {
      const paths = res.tempFiles.map(f => ({
        path: f.tempFilePath,
        name: (f as any).name || `photo-${Date.now()}.jpg`,
      }))
      void processPaths(paths)
    },
  })
}

/** H5：file input */
function pickImagesH5() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async () => {
    const list = input.files
    if (!list?.length)
      return
    const remain = appendMode.value ? MAX_WATERMARK_PHOTOS - items.value.length : MAX_WATERMARK_PHOTOS
    const picked = Array.from(list).slice(0, remain)
    const paths: { path: string, name: string }[] = []
    for (const file of picked) {
      paths.push({ path: await readFileAsDataUrl(file), name: file.name })
    }
    await processPaths(paths)
  }
  input.click()
}

function pickImages() {
  // #ifdef H5
  pickImagesH5()
  // #endif
  // #ifndef H5
  pickImagesMp()
  // #endif
}

const rerenderAll = debounce(async () => {
  if (!items.value.length || processing.value)
    return
  processing.value = true
  processedCount.value = 0
  pendingCount.value = items.value.length
  const style = getWatermarkStyle()
  try {
    const next: WatermarkItem[] = []
    for (const item of items.value) {
      const previewSrc = await renderWatermarkedImage(item.originalSrc, style)
      next.push({ ...item, previewSrc })
      processedCount.value += 1
    }
    items.value = next
  }
  catch {
    uni.showToast({ title: '水印更新失败', icon: 'none' })
  }
  finally {
    processing.value = false
    processedCount.value = 0
    pendingCount.value = 0
  }
}, 300)

watch(
  [customMark, timeMark, watermarkPosition, watermarkOpacity, fontSizeMode, customFontSize, watermarkColorMode, customWatermarkColor, watermarkRotation, watermarkFont],
  () => {
    if (items.value.length)
      rerenderAll()
  },
)

function clearAll() {
  items.value = []
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function openViewer(index: number) {
  if (!items.value.length || processing.value)
    return
  uni.previewImage({
    current: index,
    urls: items.value.map(i => i.previewSrc),
  })
}

async function saveToAlbum(filePath: string) {
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })
}

async function downloadSingle(item: WatermarkItem) {
  if (processing.value) {
    uni.showToast({ title: '处理中，请稍候', icon: 'none' })
    return
  }
  downloadingId.value = item.id
  try {
    const path = await getExportPath(item)
    const ext = getExportExtension(exportFormat.value)
    // #ifdef H5
    const link = document.createElement('a')
    link.href = path
    link.download = `${item.name}-watermarked.${ext}`
    link.click()
    // #endif
    // #ifndef H5
    await saveToAlbum(path)
    // #endif
    uni.showToast({ title: '已保存', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
  finally {
    downloadingId.value = ''
  }
}

async function downloadAllImages() {
  if (!items.value.length) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }
  if (processing.value) {
    uni.showToast({ title: '处理中，请稍候', icon: 'none' })
    return
  }
  if (items.value.length === 1) {
    await downloadSingle(items.value[0]!)
    return
  }

  loading.value = true
  try {
    // #ifdef H5
    const zip = new JSZip()
    const ext = getExportExtension(exportFormat.value)
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]!
      const dataUrl = await getExportPath(item)
      const base64 = dataUrl.split(',')[1]
      if (base64)
        zip.file(`${item.name}-watermarked-${i + 1}.${ext}`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'watermarked-images.zip'
    link.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: '已开始下载', icon: 'success' })
    // #endif
    // #ifndef H5
    for (const item of items.value) {
      const path = await getExportPath(item)
      await saveToAlbum(path)
    }
    uni.showToast({ title: '已全部保存到相册', icon: 'success' })
    // #endif
  }
  catch {
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

function pickCustomColorH5() {
  const input = document.createElement('input')
  input.type = 'color'
  input.value = customWatermarkColor.value
  input.onchange = () => {
    customWatermarkColor.value = input.value
  }
  input.click()
}

function onOpacityChange(e: { detail: { value: number } }) {
  watermarkOpacity.value = e.detail.value
}

function onRotationChange(e: { detail: { value: number } }) {
  watermarkRotation.value = e.detail.value
}

function onJpegQualityChange(e: { detail: { value: number } }) {
  jpegQuality.value = e.detail.value
}
</script>

<template>
  <scroll-view scroll-y class="watermark-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4 flex flex-col">
      <tool-card title="批量加水印" desc="选择多张图片，添加自定义文字与时间水印，预览后导出">
        <view class="u-grid-2 u-gap-2">
          <wd-input v-model="customMark" label="自定义水印文字" placeholder="我的水印" />
          <view>
            <text class="mb-1 block text-xs text-tech-muted">时间水印</text>
            <picker :range="timeMarkOptions" :value="timeMarkIndex" @change="timeMarkIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ timeMarkOptions[timeMarkIndex] }}
              </view>
            </picker>
          </view>
        </view>

        <view class="u-grid-2 u-gap-2 mt-3">
          <view>
            <text class="mb-1 block text-xs text-tech-muted">水印位置</text>
            <picker :range="positionOptions.map(p => p.label)" :value="positionIndex" @change="positionIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ positionOptions[positionIndex]?.label }}
              </view>
            </picker>
          </view>
          <view>
            <text class="mb-1 block text-xs text-tech-muted">字体</text>
            <picker :range="WATERMARK_FONT_OPTIONS.map(f => f.label)" :value="fontIndex" @change="fontIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ WATERMARK_FONT_OPTIONS[fontIndex]?.label }}
              </view>
            </picker>
          </view>
        </view>

        <view class="u-grid-2 u-gap-2 mt-3">
          <view>
            <text class="mb-1 block text-xs text-tech-muted">字号</text>
            <picker :range="fontSizeModeOptions" :value="fontSizeModeIndex" @change="fontSizeModeIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ fontSizeModeOptions[fontSizeModeIndex] }}
              </view>
            </picker>
          </view>
          <wd-input
            v-model="customFontSize"
            type="number"
            label="固定字号 px"
            :disabled="fontSizeMode === 'auto'"
          />
        </view>

        <view class="u-grid-2 u-gap-2 mt-3">
          <view>
            <text class="mb-1 block text-xs text-tech-muted">文字颜色</text>
            <picker :range="colorModeOptions" :value="colorModeIndex" @change="colorModeIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ colorModeOptions[colorModeIndex] }}
              </view>
            </picker>
          </view>
          <!-- #ifdef H5 -->
          <view v-if="watermarkColorMode === 'custom'">
            <text class="mb-1 block text-xs text-tech-muted">自定义色值</text>
            <view class="u-gap-2 flex items-center">
              <view class="color-swatch h-10 w-10 border border-tech rounded" :style="{ background: customWatermarkColor }" @click="pickCustomColorH5" />
              <wd-input v-model="customWatermarkColor" label="" placeholder="#ffffff" />
            </view>
          </view>
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <wd-input v-if="watermarkColorMode === 'custom'" v-model="customWatermarkColor" label="色值 #RRGGBB" />
          <!-- #endif -->
        </view>

        <view class="mt-3">
          <view class="mb-1 flex justify-between text-xs text-tech-muted">
            <text>透明度</text>
            <text>{{ watermarkOpacity }}%</text>
          </view>
          <slider :value="watermarkOpacity" :min="20" :max="100" :step="5" active-color="var(--cyber-primary)" @change="onOpacityChange" />
        </view>

        <view class="mt-3">
          <view class="mb-1 flex justify-between text-xs text-tech-muted">
            <text>旋转角度</text>
            <text>{{ watermarkRotation }}°</text>
          </view>
          <slider :value="watermarkRotation" :min="-45" :max="45" :step="5" active-color="var(--cyber-primary)" @change="onRotationChange" />
          <text class="mt-1 block text-xs text-tech-subtle">平铺模式未设置时默认 -30°</text>
        </view>

        <view class="mt-3 flex items-center">
          <switch :checked="appendMode" color="var(--cyber-primary)" @change="appendMode = ($event as any).detail.value" />
          <text class="ml-2 text-sm text-tech-muted">追加选图（最多 {{ MAX_WATERMARK_PHOTOS }} 张）</text>
        </view>

        <!-- #ifdef H5 -->
        <wd-button block class="mt-4" @click="pickImages">
          选择图片
        </wd-button>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <wd-button block class="mt-4" @click="pickImages">
          从相册选择
        </wd-button>
        <!-- #endif -->

        <text v-if="processing" class="mt-2 block text-sm text-tech-muted">
          正在处理 {{ processedCount }}/{{ pendingCount }} 张…
        </text>
      </tool-card>

      <tool-card title="预览与下载">
        <view class="u-grid-2 u-gap-2">
          <view>
            <text class="mb-1 block text-xs text-tech-muted">导出格式</text>
            <picker :range="exportFormatOptions" :value="exportFormatIndex" @change="exportFormatIndex = Number(($event as any).detail.value)">
              <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                {{ exportFormatOptions[exportFormatIndex] }}
              </view>
            </picker>
          </view>
          <view>
            <view class="mb-1 flex justify-between text-xs text-tech-muted">
              <text>JPEG 质量</text>
              <text>{{ jpegQuality }}%</text>
            </view>
            <slider
              :value="jpegQuality"
              :min="60"
              :max="100"
              :step="5"
              :disabled="exportFormat !== 'jpeg'"
              active-color="var(--cyber-primary)"
              @change="onJpegQualityChange"
            />
          </view>
        </view>

        <view class="mt-4 flex flex-wrap items-center justify-between">
          <text class="text-sm text-tech-subtle">
            {{ items.length ? `已选 ${items.length} / ${MAX_WATERMARK_PHOTOS} 张` : '预览已选照片' }}
          </text>
          <view class="u-gap-2 flex flex-wrap">
            <wd-button v-if="items.length" size="small" :disabled="processing" @click="clearAll">
              清空
            </wd-button>
            <wd-button size="small" :loading="loading" :disabled="!items.length || processing" @click="downloadAllImages">
              {{ loading ? '导出中…' : '导出全部' }}
            </wd-button>
          </view>
        </view>

        <text v-if="!items.length && !processing" class="py-8 text-center text-sm text-tech-muted">
          请先选择图片，修改水印样式后会自动更新预览
        </text>

        <view v-else class="u-grid-2 u-gap-3 mt-4">
          <view
            v-for="(item, index) in items"
            :key="item.id"
            class="overflow-hidden border border-tech rounded-lg"
          >
            <image
              :src="item.previewSrc"
              mode="widthFix"
              class="w-full"
              @click="openViewer(index)"
            />
            <view class="u-gap-2 flex flex-wrap p-2">
              <wd-button size="small" :loading="downloadingId === item.id" @click="downloadSingle(item)">
                保存
              </wd-button>
              <wd-button size="small" type="warning" @click="removeItem(index)">
                移除
              </wd-button>
            </view>
            <text class="block truncate px-2 pb-2 text-xs text-tech-muted">{{ item.name }}</text>
          </view>
        </view>
      </tool-card>
    </view>

    <!-- MP 离屏导出 canvas -->
    <!-- #ifndef H5 -->
    <canvas id="wm-export-canvas" type="2d" class="fixed left-0 top-0 h-px w-px opacity-0" />
    <!-- #endif -->
  </scroll-view>
</template>

<style lang="scss" scoped>
.cyber-input-like {
  background: var(--tech-input-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
}
</style>

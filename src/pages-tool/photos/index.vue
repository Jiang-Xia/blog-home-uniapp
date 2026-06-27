<!--
  光影边框 — 本地选图后在 Canvas 绘制渐变背景 + 圆角照片 + 品牌 logo。
  H5：file input + ZIP；MP：chooseMedia + 保存相册（无 Worker）。
-->
<script lang="ts" setup>
import JSZip from 'jszip'
import { debounce } from '@/utils/debounce'
import {
  DEFAULT_PHOTO_SETTINGS,
  LOGO_BRAND_OPTIONS,
  MAX_PHOTOS,

} from '@/utils/tool/photo-constants'
import type { PhotoSettings } from '@/utils/tool/photo-constants'
import { EXPORT_SIZE, renderPhotoFrameOutput } from '@/utils/tool/photo-renderer'

definePage({
  style: { navigationBarTitleText: '光影边框' },
})

interface PhotoItem {
  id: string
  src: string
  name: string
  previewSrc: string
}

const settings = reactive<PhotoSettings>({ ...DEFAULT_PHOTO_SETTINGS })
const appliedSettings = ref<PhotoSettings>({ ...DEFAULT_PHOTO_SETTINGS })
const items = ref<PhotoItem[]>([])
const currentIndex = ref(0)
const processing = ref(false)
const exportLoading = ref(false)
const logoBrandIndex = ref(0)

const currentPhoto = computed(() => items.value[currentIndex.value] ?? null)

watch(logoBrandIndex, (i) => {
  settings.logoBrand = LOGO_BRAND_OPTIONS[i]?.value ?? ''
})

const applySettings = debounce(() => {
  appliedSettings.value = { ...settings }
  if (items.value.length)
    void rerenderAll()
}, 250)

watch(settings, applySettings, { deep: true })

async function rerenderAll() {
  processing.value = true
  try {
    const next: PhotoItem[] = []
    for (const item of items.value) {
      const previewSrc = await renderPhotoFrameOutput(item.src, appliedSettings.value, EXPORT_SIZE)
      next.push({ ...item, previewSrc })
    }
    items.value = next
  }
  catch {
    uni.showToast({ title: '预览更新失败', icon: 'none' })
  }
  finally {
    processing.value = false
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

async function addPaths(paths: { path: string, name: string }[]) {
  const remain = MAX_PHOTOS - items.value.length
  if (remain <= 0) {
    uni.showToast({ title: `最多 ${MAX_PHOTOS} 张`, icon: 'none' })
    return
  }
  const toAdd = paths.slice(0, remain)
  processing.value = true
  try {
    for (const p of toAdd) {
      const previewSrc = await renderPhotoFrameOutput(p.path, appliedSettings.value, EXPORT_SIZE)
      items.value.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        src: p.path,
        name: p.name.replace(/\.[^.]+$/, '') || 'photo',
        previewSrc,
      })
    }
  }
  catch {
    uni.showToast({ title: '图片处理失败', icon: 'none' })
  }
  finally {
    processing.value = false
  }
}

function pickImagesMp() {
  const remain = MAX_PHOTOS - items.value.length
  if (remain <= 0)
    return
  uni.chooseMedia({
    count: Math.min(remain, 9),
    mediaType: ['image'],
    success: (res) => {
      void addPaths(res.tempFiles.map(f => ({
        path: f.tempFilePath,
        name: (f as any).name || 'photo.jpg',
      })))
    },
  })
}

function pickImagesH5() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async () => {
    const list = input.files
    if (!list?.length)
      return
    const remain = MAX_PHOTOS - items.value.length
    const paths: { path: string, name: string }[] = []
    for (const file of Array.from(list).slice(0, remain))
      paths.push({ path: await readFileAsDataUrl(file), name: file.name })
    await addPaths(paths)
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

function removePhoto(index: number) {
  items.value.splice(index, 1)
  if (currentIndex.value >= items.value.length)
    currentIndex.value = Math.max(0, items.value.length - 1)
}

function openViewer(index: number) {
  uni.previewImage({
    current: index,
    urls: items.value.map(i => i.previewSrc),
  })
}

async function saveToAlbum(filePath: string) {
  await new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({ filePath, success: () => resolve(), fail: reject })
  })
}

async function exportSingle(item: PhotoItem) {
  exportLoading.value = true
  try {
    const output = await renderPhotoFrameOutput(item.src, appliedSettings.value, EXPORT_SIZE)
    // #ifdef H5
    const link = document.createElement('a')
    link.href = output
    link.download = `${item.name}-frame.jpg`
    link.click()
    // #endif
    // #ifndef H5
    await saveToAlbum(output)
    // #endif
    uni.showToast({ title: '已保存', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
  finally {
    exportLoading.value = false
  }
}

async function exportAll() {
  if (!items.value.length)
    return
  if (items.value.length === 1) {
    await exportSingle(items.value[0]!)
    return
  }
  exportLoading.value = true
  try {
    // #ifdef H5
    const zip = new JSZip()
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]!
      const dataUrl = await renderPhotoFrameOutput(item.src, appliedSettings.value, EXPORT_SIZE)
      const base64 = dataUrl.split(',')[1]
      if (base64)
        zip.file(`${item.name}-frame-${i + 1}.jpg`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'photo-frames.zip'
    link.click()
    URL.revokeObjectURL(url)
    // #endif
    // #ifndef H5
    for (const item of items.value) {
      const path = await renderPhotoFrameOutput(item.src, appliedSettings.value, EXPORT_SIZE)
      await saveToAlbum(path)
    }
    // #endif
    uni.showToast({ title: '导出完成', icon: 'success' })
  }
  catch {
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
  finally {
    exportLoading.value = false
  }
}

function onSliderChange(key: keyof PhotoSettings, e: { detail: { value: number } }) {
  ;(settings as any)[key] = e.detail.value
}
</script>

<template>
  <scroll-view scroll-y class="photos-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4 flex flex-col">
      <tool-card title="光影边框" desc="为照片添加渐变背景、圆角与品牌 logo，批量导出">
        <view class="u-grid-2 u-gap-2">
          <view>
            <view class="mb-1 flex justify-between text-xs text-tech-muted">
              <text>内边距</text>
              <text>{{ settings.padding }}px</text>
            </view>
            <slider :value="settings.padding" :min="8" :max="64" :step="2" active-color="var(--cyber-primary)" @change="onSliderChange('padding', $event)" />
          </view>
          <view>
            <view class="mb-1 flex justify-between text-xs text-tech-muted">
              <text>背景模糊</text>
              <text>{{ settings.blur }}px</text>
            </view>
            <slider :value="settings.blur" :min="0" :max="40" :step="2" active-color="var(--cyber-primary)" @change="onSliderChange('blur', $event)" />
          </view>
        </view>

        <view class="u-grid-2 u-gap-2 mt-3">
          <view>
            <view class="mb-1 flex justify-between text-xs text-tech-muted">
              <text>圆角</text>
              <text>{{ settings.borderRadius }}px</text>
            </view>
            <slider :value="settings.borderRadius" :min="0" :max="32" :step="2" active-color="var(--cyber-primary)" @change="onSliderChange('borderRadius', $event)" />
          </view>
          <view>
            <view class="mb-1 flex justify-between text-xs text-tech-muted">
              <text>阴影</text>
              <text>{{ settings.shadow }}px</text>
            </view>
            <slider :value="settings.shadow" :min="0" :max="24" :step="2" active-color="var(--cyber-primary)" @change="onSliderChange('shadow', $event)" />
          </view>
        </view>

        <view class="mt-3">
          <text class="mb-1 block text-xs text-tech-muted">品牌 Logo</text>
          <picker :range="LOGO_BRAND_OPTIONS.map(o => o.label)" :value="logoBrandIndex" @change="logoBrandIndex = Number(($event as any).detail.value)">
            <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
              {{ LOGO_BRAND_OPTIONS[logoBrandIndex]?.label }}
            </view>
          </picker>
        </view>

        <wd-button block class="mt-4" @click="pickImages">
          选择图片（最多 {{ MAX_PHOTOS }} 张）
        </wd-button>
        <text v-if="processing" class="mt-2 block text-sm text-tech-muted">处理中…</text>
      </tool-card>

      <tool-card v-if="currentPhoto" title="预览">
        <image :src="currentPhoto.previewSrc" mode="widthFix" class="w-full rounded-lg" @click="openViewer(currentIndex)" />
        <view class="u-gap-2 mt-4 flex flex-wrap">
          <wd-button size="small" :loading="exportLoading" @click="exportSingle(currentPhoto)">
            导出当前
          </wd-button>
          <wd-button size="small" :loading="exportLoading" :disabled="!items.length" @click="exportAll">
            导出全部
          </wd-button>
        </view>
      </tool-card>

      <tool-card v-if="items.length" title="已选图片">
        <view class="u-grid-3 u-gap-2">
          <view
            v-for="(item, index) in items"
            :key="item.id"
            class="relative overflow-hidden border rounded"
            :class="index === currentIndex ? 'border-primary' : 'border-tech'"
            @click="currentIndex = index"
          >
            <image :src="item.previewSrc" mode="aspectFill" class="h-20 w-full" />
            <view class="absolute right-0 top-0 p-1" @click.stop="removePhoto(index)">
              <text class="text-warning text-xs">×</text>
            </view>
          </view>
        </view>
      </tool-card>
    </view>

    <!-- #ifndef H5 -->
    <canvas id="photo-export-canvas" type="2d" class="fixed left-0 top-0 h-px w-px opacity-0" />
    <!-- #endif -->
  </scroll-view>
</template>

<style lang="scss" scoped>
.cyber-input-like {
  background: var(--tech-input-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
}
.border-primary {
  border-color: var(--cyber-primary, #8b5cf6);
}
</style>

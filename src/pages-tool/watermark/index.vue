<!-- #ifdef H5 -->
<script lang="ts" setup>
import JSZip from 'jszip'

definePage({
  style: { navigationBarTitleText: '批量水印' },
})

const watermarkText = ref('Blog Home')
const fontSize = ref(24)
const opacity = ref(0.35)
const processing = ref(false)
const files = ref<{ name: string, dataUrl: string }[]>([])

function pickImages() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async () => {
    const list = input.files
    if (!list?.length)
      return
    files.value = []
    for (const file of Array.from(list)) {
      const dataUrl = await readFileAsDataUrl(file)
      files.value.push({ name: file.name, dataUrl })
    }
  }
  input.click()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function renderWatermarked(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  ctx.globalAlpha = opacity.value
  ctx.fillStyle = '#ffffff'
  ctx.font = `${fontSize.value}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(watermarkText.value, canvas.width / 2, canvas.height / 2)
  return canvas.toDataURL('image/jpeg', 0.92)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function exportZip() {
  if (!files.value.length)
    return
  processing.value = true
  try {
    const zip = new JSZip()
    for (const f of files.value) {
      const out = await renderWatermarked(f.dataUrl)
      const base64 = out.split(',')[1]
      zip.file(`${f.name.replace(/\.\w+$/, '')}-wm.jpg`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'watermarked.zip'
    a.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: '已下载 ZIP', icon: 'success' })
  }
  finally {
    processing.value = false
  }
}
</script>

<template>
  <scroll-view scroll-y class="watermark-page cyber-page-grid u-page-scroll u-page-body py-4">
    <wd-input v-model="watermarkText" label="水印文字" />
    <wd-input v-model="fontSize" type="number" label="字号" class="mt-3" />
    <wd-input v-model="opacity" type="number" label="透明度 0-1" class="mt-3" />
    <wd-button block class="mt-4" @click="pickImages">
      选择图片
    </wd-button>
    <text class="mt-2 block text-xs text-tech-subtle">已选 {{ files.length }} 张</text>
    <wd-button block class="mt-4" :loading="processing" :disabled="!files.length" @click="exportZip">
      批量导出 ZIP
    </wd-button>
  </scroll-view>
</template>

<script lang="ts" setup>
definePage({ style: { navigationBarTitleText: '批量水印' } })
</script>
<!-- #endif -->

<!-- #ifndef H5 -->
<template>
  <view class="watermark-page cyber-page-grid p-8 text-center text-tech-subtle">
    批量水印请在浏览器 H5 版使用
  </view>
</template>

<!-- #endif -->

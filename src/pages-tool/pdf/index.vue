<!--
  PDF 电子签名工具页 — 预览 PDF、倒计时后手写签名，合成并下载。
  默认示例 PDF 来自站点静态资源；支持 ?file= 远程 URL 或本地上传。
-->
<script lang="ts" setup>
import { resolveStaticUrl } from '@/utils/static-url'
import PdfSignature from '@/components/tool/pdf-signature.vue'

definePage({
  style: { navigationBarTitleText: 'PDF 电子签名' },
})

const DEMO_PDF_PATH = '/static/uploads/2024-03/eqiic4bsyyu39pd95y7e7h-保证书（不可撤消）.pdf'
const DEMO_PDF_SRC = resolveStaticUrl(DEMO_PDF_PATH)

const pdfSrc = ref(DEMO_PDF_SRC)
const pdfKey = ref(0)
const usingCustomPdf = ref(false)
const hintText = ref('')
const sourceLabel = ref('示例保证书')

let objectUrl: string | null = null

/** 解析路由 ?file= 参数 */
function initFromQuery() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const queryFile = page?.options?.file as string | undefined
  if (queryFile?.trim()) {
    pdfSrc.value = queryFile.startsWith('/static')
      ? resolveStaticUrl(queryFile.trim())
      : queryFile.trim()
    usingCustomPdf.value = true
    sourceLabel.value = 'URL 参数指定'
    hintText.value = '当前使用 URL 参数指定的 PDF'
  }
}

function onFilePickH5() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/pdf,.pdf'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file)
      return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      hintText.value = '请选择 PDF 文件'
      return
    }
    if (objectUrl)
      URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(file)
    pdfSrc.value = objectUrl
    usingCustomPdf.value = true
    pdfKey.value += 1
    sourceLabel.value = file.name
    hintText.value = `已加载本地文件：${file.name}`
  }
  input.click()
}

function onFilePickMp() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['pdf'],
    success: (res) => {
      const file = res.tempFiles[0]
      if (!file)
        return
      pdfSrc.value = file.path
      usingCustomPdf.value = true
      pdfKey.value += 1
      sourceLabel.value = file.name
      hintText.value = `已加载：${file.name}`
    },
  })
}

function pickPdf() {
  // #ifdef H5
  onFilePickH5()
  // #endif
  // #ifndef H5
  onFilePickMp()
  // #endif
}

function resetToDemo() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  pdfSrc.value = DEMO_PDF_SRC
  usingCustomPdf.value = false
  pdfKey.value += 1
  sourceLabel.value = '示例保证书'
  hintText.value = ''
}

function onSignSuccess(blob: Blob) {
  // #ifdef H5
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '已签名文件.pdf'
  link.click()
  URL.revokeObjectURL(url)
  // #endif
  // #ifndef H5
  const fs = uni.getFileSystemManager()
  const path = `${(uni as any).env.USER_DATA_PATH}/signed-${Date.now()}.pdf`
  blob.arrayBuffer().then((buf) => {
    fs.writeFile({
      filePath: path,
      data: buf,
      success: () => {
        uni.openDocument({ filePath: path, showMenu: true })
      },
      fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
    })
  })
  // #endif
  uni.showToast({ title: '已签名 PDF', icon: 'success' })
}

onLoad(() => {
  initFromQuery()
})

onBeforeUnmount(() => {
  if (objectUrl)
    URL.revokeObjectURL(objectUrl)
})
</script>

<template>
  <scroll-view scroll-y class="pdf-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4 flex flex-col">
      <tool-card title="PDF 电子签名" desc="在线预览 PDF，阅读确认后手写签名并下载">
        <view class="u-gap-2 mb-3 flex flex-wrap">
          <text class="border border-tech rounded-full px-3 py-1 text-xs text-tech-muted">1. 选择 PDF</text>
          <text class="border border-tech rounded-full px-3 py-1 text-xs text-tech-muted">2. 阅读并倒计时</text>
          <text class="border border-tech rounded-full px-3 py-1 text-xs text-tech-muted">3. 手写签名并下载</text>
        </view>

        <view class="u-gap-2 flex flex-wrap">
          <wd-button size="small" @click="pickPdf">
            选择 PDF
          </wd-button>
          <wd-button v-if="usingCustomPdf" size="small" @click="resetToDemo">
            恢复示例
          </wd-button>
        </view>

        <text v-if="hintText" class="mt-3 block text-sm text-tech-muted">{{ hintText }}</text>
        <text v-else class="mt-3 block text-xs text-tech-subtle">当前文档：{{ sourceLabel }}</text>
      </tool-card>

      <tool-card title="预览与签名" desc="滚动阅读全文，倒计时结束后即可签名">
        <pdf-signature :key="pdfKey" :pdf-src="pdfSrc" @success="onSignSuccess" />
      </tool-card>
    </view>
  </scroll-view>
</template>

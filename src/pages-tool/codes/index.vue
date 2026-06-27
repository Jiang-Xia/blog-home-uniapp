<script lang="ts" setup>
/**
 * 条形码 + 二维码 — 对齐 Nuxt tool/codes
 * H5：canvas DOM；小程序：canvas type="2d" + QR dataURL image
 */
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

definePage({
  style: { navigationBarTitleText: '条形/二维码' },
})

const defaultSiteUrl = import.meta.env.VITE_NUXT_HOME_URL || 'https://jiang-xia.top'
const barcodeVal = ref('')
const qrcodeVal = ref(defaultSiteUrl)
const qrcodeDataUrl = ref('')
const barcodeCanvasId = 'tool-barcode-canvas'

function randomCode() {
  return `NO ${Math.floor(Math.random() * 100000000000).toString()}`
}

/** pharmacode 条码绘制选项 */
const barcodeOptions = {
  format: 'pharmacode' as const,
  lineColor: '#37cdbe',
  width: 4,
  height: 60,
  displayValue: true,
}

/** H5：直接对 canvas 元素调用 JsBarcode */
function renderBarcodeH5() {
  // #ifdef H5
  try {
    JsBarcode(`#${barcodeCanvasId}`, '1234', {
      ...barcodeOptions,
      text: barcodeVal.value,
    })
  }
  catch {
    uni.showToast({ title: '条码生成失败', icon: 'none' })
  }
  // #endif
}

/** 小程序：canvas 2d 节点渲染条码 */
function renderBarcodeMp() {
  // #ifndef H5
  const query = uni.createSelectorQuery()
  ;(query.select(`#${barcodeCanvasId}`) as any)
    .fields({ node: true, size: true })
    .exec((res) => {
      const item = res?.[0] as { node?: HTMLCanvasElement, width?: number, height?: number } | undefined
      if (!item?.node)
        return
      const canvas = item.node
      const dpr = uni.getSystemInfoSync().pixelRatio || 2
      canvas.width = (item.width || 300) * dpr
      canvas.height = (item.height || 120) * dpr
      try {
        JsBarcode(canvas, '1234', {
          ...barcodeOptions,
          text: barcodeVal.value,
        })
      }
      catch {
        uni.showToast({ title: '条码生成失败', icon: 'none' })
      }
    })
  // #endif
}

function createBarcode(useRandom?: boolean) {
  if (useRandom)
    barcodeVal.value = randomCode()
  // #ifdef H5
  renderBarcodeH5()
  // #endif
  // #ifndef H5
  nextTick(() => renderBarcodeMp())
  // #endif
}

async function createQRCode() {
  try {
    qrcodeDataUrl.value = await QRCode.toDataURL(qrcodeVal.value, {
      width: 128,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }
  catch {
    uni.showToast({ title: '二维码生成失败', icon: 'none' })
  }
}

onMounted(() => {
  createBarcode()
  void createQRCode()
})

watch(qrcodeVal, () => {
  void createQRCode()
})
</script>

<template>
  <scroll-view scroll-y class="codes-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-4">
      <tool-card title="条形码">
        <view class="u-gap-2 flex flex-wrap">
          <view class="min-w-0 flex-1">
            <wd-input v-model="barcodeVal" placeholder="text" />
          </view>
          <view>
            <wd-button size="small" @click="createBarcode(true)">
              测试
            </wd-button>
          </view>
          <view>
            <wd-button size="small" type="primary" @click="createBarcode()">
              生成
            </wd-button>
          </view>
        </view>
        <view class="codes-preview mt-4 flex items-center justify-center">
          <!-- #ifdef H5 -->
          <canvas :id="barcodeCanvasId" class="barcode-canvas" />
          <!-- #endif -->
          <!-- #ifndef H5 -->
          <canvas :id="barcodeCanvasId" type="2d" class="barcode-canvas" />
          <!-- #endif -->
        </view>
      </tool-card>

      <tool-card title="二维码">
        <view class="u-gap-2 flex flex-wrap">
          <view class="min-w-0 flex-1">
            <wd-input v-model="qrcodeVal" placeholder="text" />
          </view>
          <view>
            <wd-button size="small" type="primary" @click="createQRCode">
              生成
            </wd-button>
          </view>
        </view>
        <view class="codes-preview mt-4 flex items-center justify-center">
          <image
            v-if="qrcodeDataUrl"
            :src="qrcodeDataUrl"
            class="qrcode-image"
            mode="aspectFit"
          />
        </view>
      </tool-card>
    </view>
  </scroll-view>
</template>

<style scoped>
.codes-preview {
  min-height: 176px;
  border-radius: 12px;
  background: var(--tech-shell-header, rgba(255, 255, 255, 0.04));
}

.barcode-canvas {
  width: 300px;
  height: 120px;
}

.qrcode-image {
  width: 128px;
  height: 128px;
}
</style>

<script lang="ts" setup>
import QRCode from 'qrcode'

definePage({
  style: { navigationBarTitleText: '二维码' },
})

const qrcodeText = ref('https://example.com')
const qrcodeDataUrl = ref('')

async function generateQr() {
  try {
    qrcodeDataUrl.value = await QRCode.toDataURL(qrcodeText.value, { width: 200, margin: 1 })
  }
  catch {
    uni.showToast({ title: '生成失败', icon: 'none' })
  }
}

onMounted(() => {
  void generateQr()
})

watch(qrcodeText, () => {
  void generateQr()
})
</script>

<template>
  <view class="qrcode-page cyber-page-grid u-page-body py-4">
    <wd-input v-model="qrcodeText" label="内容" placeholder="URL 或文本" />
    <view class="cyber-output-panel mt-4 flex justify-center">
      <image v-if="qrcodeDataUrl" :src="qrcodeDataUrl" class="h-52 w-52" mode="aspectFit" />
    </view>
    <wd-button block class="mt-4" @click="generateQr">
      重新生成
    </wd-button>
  </view>
</template>

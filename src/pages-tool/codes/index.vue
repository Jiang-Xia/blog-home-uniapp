<script lang="ts" setup>
import { enc } from 'crypto-js'

definePage({
  style: { navigationBarTitleText: '编码转换' },
})

const mode = ref<'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode'>('base64-encode')
const input = ref('')
const output = computed(() => {
  try {
    switch (mode.value) {
      case 'base64-encode':
        return enc.Base64.stringify(enc.Utf8.parse(input.value))
      case 'base64-decode':
        return enc.Utf8.stringify(enc.Base64.parse(input.value))
      case 'url-encode':
        return encodeURIComponent(input.value)
      case 'url-decode':
        return decodeURIComponent(input.value)
      default:
        return ''
    }
  }
  catch {
    return '转换失败，请检查输入'
  }
})

function copyOutput() {
  uni.setClipboardData({ data: output.value, success: () => uni.showToast({ title: '已复制', icon: 'success' }) })
}
</script>

<template>
  <view class="codes-page px-4 py-4">
    <view class="mb-4 flex flex-wrap gap-2">
      <wd-button
        v-for="m in ['base64-encode', 'base64-decode', 'url-encode', 'url-decode']"
        :key="m"
        size="small"
        :type="mode === m ? 'primary' : undefined"
        @click="mode = m as any"
      >
        {{ m }}
      </wd-button>
    </view>
    <wd-textarea v-model="input" placeholder="输入文本" />
    <view class="mt-4 rounded bg-gray-50 p-3">
      <text class="mb-2 block text-xs text-gray-500">输出</text>
      <text class="break-all text-sm">{{ output }}</text>
    </view>
    <wd-button block class="mt-4" @click="copyOutput">
      复制结果
    </wd-button>
  </view>
</template>

<style scoped>
.codes-page {
  min-height: 100vh;
  background: #fff;
}
</style>

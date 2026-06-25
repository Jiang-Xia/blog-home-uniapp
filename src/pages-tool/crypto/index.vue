<script lang="ts" setup>
import CryptoJS from 'crypto-js'

definePage({
  style: { navigationBarTitleText: '对称加密' },
})

const algorithms = [
  { value: 'AES', label: 'AES' },
  { value: 'DES', label: 'DES' },
  { value: 'TripleDES', label: 'TripleDES' },
  { value: 'RC4', label: 'RC4' },
  { value: 'Rabbit', label: 'Rabbit' },
] as const

type Algo = typeof algorithms[number]['value']

const algorithm = ref<Algo>('AES')
const secretKey = ref('')
const iv = ref('pianyiliang')
const outputType = ref<'Hex' | 'Base64'>('Hex')
const plaintext = ref('')
const ciphertext = ref('')

function createKey() {
  secretKey.value = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
}

function encryptText() {
  if (!plaintext.value || !secretKey.value) {
    uni.showToast({ title: '请填写原文与密钥', icon: 'none' })
    return
  }
  try {
    const word = CryptoJS.enc.Utf8.parse(plaintext.value)
    const key = CryptoJS.enc.Utf8.parse(secretKey.value)
    const offset = CryptoJS.enc.Utf8.parse(iv.value)
    const type = algorithm.value
    const encrypted = (CryptoJS as any)[type].encrypt(word, key, {
      iv: offset,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    ciphertext.value = outputType.value === 'Hex'
      ? encrypted.toString(CryptoJS.format.Hex).toUpperCase()
      : encrypted.toString()
  }
  catch {
    uni.showToast({ title: '加密失败', icon: 'none' })
  }
}

function decryptText() {
  if (!ciphertext.value || !secretKey.value) {
    uni.showToast({ title: '请填写密文与密钥', icon: 'none' })
    return
  }
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.value)
    const offset = CryptoJS.enc.Utf8.parse(iv.value)
    const encryptedWord = outputType.value === 'Hex'
      ? CryptoJS.format.Hex.parse(ciphertext.value)
      : ciphertext.value
    const type = algorithm.value
    const bytes = (CryptoJS as any)[type].decrypt(encryptedWord, key, {
      iv: offset,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    const result = bytes.toString(CryptoJS.enc.Utf8)
    if (!result) {
      uni.showToast({ title: '解密失败', icon: 'none' })
      return
    }
    plaintext.value = result
  }
  catch {
    uni.showToast({ title: '解密失败', icon: 'none' })
  }
}

onMounted(createKey)
</script>

<template>
  <scroll-view scroll-y class="crypto-page cyber-page-grid u-page-scroll u-page-body py-4">
    <cyber-card class="cyber-card-pad-sm">
      <view class="mb-3">
        <text class="mb-2 block text-sm text-tech-muted">算法</text>
        <view class="u-gap-2 flex flex-wrap">
          <wd-button
            v-for="item in algorithms"
            :key="item.value"
            size="small"
            :type="algorithm === item.value ? 'primary' : undefined"
            @click="algorithm = item.value"
          >
            {{ item.label }}
          </wd-button>
        </view>
      </view>
      <wd-input v-model="secretKey" label="密钥" placeholder="密钥" />
      <wd-input v-model="iv" label="偏移量 IV" placeholder="IV" class="mt-3" />
      <view class="u-gap-2 mt-3 flex">
        <wd-button size="small" :type="outputType === 'Hex' ? 'primary' : undefined" @click="outputType = 'Hex'">
          Hex
        </wd-button>
        <wd-button size="small" :type="outputType === 'Base64' ? 'primary' : undefined" @click="outputType = 'Base64'">
          Base64
        </wd-button>
        <wd-button size="small" @click="createKey">
          生成密钥
        </wd-button>
      </view>
      <wd-textarea v-model="plaintext" label="原文" class="mt-3" />
      <wd-textarea v-model="ciphertext" label="密文" class="mt-3" />
      <view class="u-gap-2 mt-4 flex">
        <wd-button size="small" @click="encryptText">
          加密 →
        </wd-button>
        <wd-button size="small" @click="decryptText">
          ← 解密
        </wd-button>
      </view>
    </cyber-card>
  </scroll-view>
</template>

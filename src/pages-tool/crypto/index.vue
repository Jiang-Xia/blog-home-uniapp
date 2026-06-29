<script lang="ts" setup>
/**
 * 对称加解密 — 对齐 Nuxt tool/des，切换算法时清空密文
 */
import CryptoJS from 'crypto-js'

definePage({
  style: { navigationBarTitleText: '对称加密' },
})

const encryptionList = [
  { value: 'AES', label: 'AES' },
  { value: 'DES', label: 'DES' },
  { value: 'TripleDES', label: 'TripleDES' },
  { value: 'RC4', label: 'RC4' },
  { value: 'Rabbit', label: 'Rabbit' },
] as const

type Algo = typeof encryptionList[number]['value']

const encryption = ref<Algo>('AES')
const secretKey = ref('')
const offset = ref('pianyiliang')
const outputType = ref<'Hex' | 'Base64'>('Hex')
const plaintext = ref('')
const ciphertext = ref('')

const encryptionLabels = encryptionList.map(item => item.label)
const outputTypeOptions = ['Hex', 'Base64'] as const

const encryptionIndex = computed(() =>
  Math.max(0, encryptionList.findIndex(item => item.value === encryption.value)),
)

const outputTypeIndex = computed(() =>
  outputTypeOptions.findIndex(item => item === outputType.value),
)

/** 切换算法时清空密文，避免跨算法误解密 */
watch(encryption, () => {
  ciphertext.value = ''
})

function onEncryptionChange(e: { detail: { value: number } }) {
  encryption.value = encryptionList[Number(e.detail.value)]?.value ?? 'AES'
}

function onOutputTypeChange(e: { detail: { value: number } }) {
  outputType.value = outputTypeOptions[Number(e.detail.value)] ?? 'Hex'
  ciphertext.value = ''
}

function createKey() {
  secretKey.value = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
}

function encryptText() {
  if (!plaintext.value) {
    uni.showToast({ title: '请先输入原文', icon: 'none' })
    return
  }
  if (!secretKey.value) {
    uni.showToast({ title: '请先输入密钥', icon: 'none' })
    return
  }
  try {
    const wordUTF8 = CryptoJS.enc.Utf8.parse(plaintext.value)
    const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value)
    const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value)
    const type = encryption.value
    const encrypted = (CryptoJS as any)[type].encrypt(wordUTF8, keyUTF8, {
      iv: offsetUTF8,
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
  if (!ciphertext.value) {
    uni.showToast({ title: '请先输入密文', icon: 'none' })
    return
  }
  if (!secretKey.value) {
    uni.showToast({ title: '请先输入密钥', icon: 'none' })
    return
  }
  try {
    const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value)
    const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value)
    const encryptedWord = outputType.value === 'Hex'
      ? CryptoJS.format.Hex.parse(ciphertext.value)
      : ciphertext.value
    const type = encryption.value
    const bytes = (CryptoJS as any)[type].decrypt(encryptedWord, keyUTF8, {
      iv: offsetUTF8,
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
    <view class="u-stack-5">
      <tool-section-header label="KEY CONFIG">
        <view class="cyber-glass-card p-3">
          <view class="u-stack-3">
            <view>
              <text class="mb-1 block text-xs text-tech-muted">加密算法</text>
              <picker :range="encryptionLabels" :value="encryptionIndex" @change="onEncryptionChange">
                <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                  {{ encryptionLabels[encryptionIndex] }}
                </view>
              </picker>
            </view>
            <wd-input v-model="secretKey" label="秘钥" placeholder="输入或生成秘钥" />
            <wd-input v-model="offset" label="偏移量 (IV)" placeholder="偏移量" />
            <view>
              <wd-button size="small" type="primary" @click="createKey">
                生成秘钥
              </wd-button>
            </view>
          </view>
        </view>
      </tool-section-header>

      <tool-section-header label="CIPHER">
        <crypto-workspace
          v-model:input="plaintext"
          v-model:output="ciphertext"
          input-label="原文"
          output-label="密文"
          input-placeholder="输入待加密的原文..."
          output-placeholder="加密结果将显示在这里..."
        >
          <template #actions>
            <view class="crypto-action-row u-gap-2 flex flex-wrap justify-center">
              <view class="crypto-action-field">
                <text class="mb-1 block text-xs text-tech-muted">输出格式</text>
                <picker :range="outputTypeOptions" :value="outputTypeIndex" @change="onOutputTypeChange">
                  <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                    {{ outputType }}
                  </view>
                </picker>
              </view>
              <view class="crypto-action-btns u-gap-2 flex flex-wrap justify-center">
                <wd-button size="small" @click="encryptText">
                  加密 →
                </wd-button>
                <wd-button size="small" @click="decryptText">
                  ← 解密
                </wd-button>
              </view>
            </view>
          </template>
        </crypto-workspace>
      </tool-section-header>

      <crypto-about-panel title="对称加密算法介绍">
        <view class="u-stack-3">
          <text class="block text-sm text-tech-muted leading-relaxed">
            对称加密算法转换工具，包含有AES加密、DES加密、RC4加密、Rabbit加密、TripleDes加密等相关对称加密算法互相转换的工具。
            除了上述的对称加密算法外，还有3DES、Blowfish、IDEA、RC5、RC6等对称加密算法
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            对称加密的优势：对称加密的速度比公钥加密快很多，在很多场合都需要对称加密
          </text>
          <text class="block text-sm text-tech font-medium">
            对称加密与非对称加密的区别
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            对称加密算法在加密和解密时使用的是同一个秘钥；而非对称加密算法需要两个密钥来进行加密和解密，这两个秘钥是公开密钥（public key）和私有密钥（private key）。
          </text>
        </view>
      </crypto-about-panel>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.crypto-action-row {
  width: 100%;
}

.crypto-action-field {
  min-width: 140px;
  flex: 1;
}

.crypto-action-btns {
  flex: 1;
  align-items: flex-end;
}
</style>

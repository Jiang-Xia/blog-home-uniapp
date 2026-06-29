<script lang="ts" setup>
/**
 * 国密 SM2 加解密 — 对齐 Nuxt tool/sm，支持公钥 130/66 压缩格式与 C1C3C2/C1C2C3
 */
import { sm2 } from 'sm-crypto'

definePage({
  style: { navigationBarTitleText: '国密 SM2' },
})

const keySizes = [
  { value: 130, label: '130 位' },
  { value: 66, label: '66 位 (压缩)' },
] as const

const cipherModes = [
  { value: 1, label: 'C1C3C2' },
  { value: 0, label: 'C1C2C3' },
] as const

const keySize = ref<130 | 66>(130)
const cipherMode = ref<0 | 1>(1)
const publicKey = ref('')
const privateKey = ref('')
const plaintext = ref('')
const ciphertext = ref('')

const keySizeLabels = keySizes.map(item => item.label)
const cipherModeLabels = cipherModes.map(item => item.label)

const keySizeIndex = computed(() =>
  Math.max(0, keySizes.findIndex(item => item.value === keySize.value)),
)

const cipherModeIndex = computed(() =>
  Math.max(0, cipherModes.findIndex(item => item.value === cipherMode.value)),
)

function onKeySizeChange(e: { detail: { value: number } }) {
  keySize.value = keySizes[Number(e.detail.value)]?.value ?? 130
}

function onCipherModeChange(e: { detail: { value: number } }) {
  cipherMode.value = cipherModes[Number(e.detail.value)]?.value ?? 1
}

/** 生成 SM2 密钥对，66 位时使用 compressPublicKeyHex 压缩公钥 */
function createKey() {
  const keypair = sm2.generateKeyPairHex()
  publicKey.value = keypair.publicKey
  privateKey.value = keypair.privateKey
  if (keySize.value === 66 && typeof sm2.compressPublicKeyHex === 'function') {
    const compressed = sm2.compressPublicKeyHex(publicKey.value)
    if (typeof sm2.comparePublicKeyHex === 'function')
      sm2.comparePublicKeyHex(publicKey.value, compressed)
    publicKey.value = compressed
  }
}

function encryptText() {
  if (!plaintext.value) {
    uni.showToast({ title: '请先输入原文', icon: 'none' })
    return
  }
  ciphertext.value = sm2.doEncrypt(plaintext.value, publicKey.value, cipherMode.value)
}

function decryptText() {
  if (!ciphertext.value) {
    uni.showToast({ title: '请先输入密文', icon: 'none' })
    return
  }
  try {
    const result = sm2.doDecrypt(ciphertext.value, privateKey.value, cipherMode.value)
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
  <scroll-view scroll-y class="sm-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-5">
      <crypto-key-pair-panel v-model:private-key="privateKey" v-model:public-key="publicKey" compact>
        <template #toolbar>
          <view class="u-stack-1 min-w-0 flex-1">
            <text class="block text-xs text-tech-muted">公钥格式</text>
            <picker :range="keySizeLabels" :value="keySizeIndex" @change="onKeySizeChange">
              <view class="cyber-input-like mt-1 rounded px-3 py-2 text-sm text-tech">
                {{ keySizeLabels[keySizeIndex] }}
              </view>
            </picker>
          </view>
          <view>
            <wd-button size="small" type="primary" @click="createKey">
              生成秘钥
            </wd-button>
          </view>
        </template>
      </crypto-key-pair-panel>

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
                <text class="mb-1 block text-xs text-tech-muted">密文顺序</text>
                <picker :range="cipherModeLabels" :value="cipherModeIndex" @change="onCipherModeChange">
                  <view class="cyber-input-like rounded px-3 py-2 text-sm text-tech">
                    {{ cipherModeLabels[cipherModeIndex] }}
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

      <crypto-about-panel title="国密 SM2 加密解密介绍">
        <view class="u-stack-3">
          <text class="block text-sm text-tech-muted leading-relaxed">
            本工具提供在线国密SM2公钥私钥生成，国密SM2加密解密功能。
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            SM2算法和RSA算法都是公钥密码算法，SM2算法是一种更先进安全的算法，在我们国家商用密码体系中被用来替换RSA算法。
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            SM2非对称加密的结果由C1,C2,C3三部分组成。其中C1是根据生成的随机数计算出的椭圆曲线点，C2是密文数据，C3是SM3的摘要值。最开始的国密标准的结果是按C1,C2,C3顺序存放的，新标准的是按C1,C3,C2顺序存放的，因此我们这边在做SM2加密时新增了密文数据顺序设置，用以兼容之前的SM2算法加密。
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

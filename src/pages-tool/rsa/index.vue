<script lang="ts" setup>
/**
 * RSA 非对称加解密 — 对齐 Nuxt tool/rsa，密钥长度 512/1024/2048/4096
 */
import JSEncrypt from 'jsencrypt'
import { rsaDecrypt, rsaEncrypt } from '@/utils/rsa'

definePage({
  style: { navigationBarTitleText: 'RSA 加解密' },
})

const keySizes = ['512', '1024', '2048', '4096'] as const
const outputTypeOptions = ['Hex', 'Base64'] as const

const keySize = ref<string>('1024')
const outputType = ref<'Hex' | 'Base64'>('Hex')
const publicKey = ref('')
const privateKey = ref('')
const plaintext = ref('')
const ciphertext = ref('')

const keySizeIndex = computed(() =>
  Math.max(0, keySizes.findIndex(size => size === keySize.value)),
)

const outputTypeIndex = computed(() =>
  outputTypeOptions.findIndex(item => item === outputType.value),
)

function onKeySizeChange(e: { detail: { value: number } }) {
  keySize.value = keySizes[Number(e.detail.value)] ?? '1024'
}

function onOutputTypeChange(e: { detail: { value: number } }) {
  outputType.value = outputTypeOptions[Number(e.detail.value)] ?? 'Hex'
}

/** 按当前密钥长度生成 RSA 密钥对 */
function createKey() {
  const crypt = new JSEncrypt({ default_key_size: keySize.value })
  crypt.getKey()
  publicKey.value = crypt.getPublicKey()
  privateKey.value = crypt.getPrivateKey()
}

function encryptText() {
  if (!plaintext.value) {
    uni.showToast({ title: '请先输入原文', icon: 'none' })
    return
  }
  ciphertext.value = rsaEncrypt(plaintext.value, publicKey.value, outputType.value)
}

function decryptText() {
  if (!ciphertext.value) {
    uni.showToast({ title: '请先输入密文', icon: 'none' })
    return
  }
  const result = rsaDecrypt(ciphertext.value, privateKey.value, outputType.value)
  if (!result) {
    uni.showToast({ title: '解密失败', icon: 'none' })
    return
  }
  plaintext.value = result
}

onMounted(createKey)
</script>

<template>
  <scroll-view scroll-y class="rsa-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-stack-5">
      <crypto-key-pair-panel v-model:private-key="privateKey" v-model:public-key="publicKey">
        <template #toolbar>
          <view class="u-stack-1 min-w-0 flex-1">
            <text class="block text-xs text-tech-muted">密钥长度</text>
            <picker :range="keySizes" :value="keySizeIndex" @change="onKeySizeChange">
              <view class="cyber-input-like mt-1 rounded px-3 py-2 text-sm text-tech">
                {{ keySize }} bit
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

      <crypto-about-panel title="RSA 算法介绍">
        <view class="u-stack-3">
          <text class="block text-sm text-tech-muted leading-relaxed">
            RSA是一种公钥密码算法，它的名字由三位开发者，即Ron Rivest、Adi Shamir和Leonard Adleman的姓氏的首字母组成的。
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            非对称加密算法中，有两个密钥：公钥和私钥。它们是一对，如果用公钥进行加密，只有用对应的私钥才能解密；如果用私钥进行加密，只有用对应的公钥才能解密。
          </text>
          <text class="block text-sm text-tech-muted leading-relaxed">
            非对称加密算法实现机密信息的交换过程为：甲方生成一对密钥并将其中一个作为公钥向其他方公开；得到该公钥的乙方使用该密钥对机密信息进行加密后发送给甲方；甲方再用自己的另一个专用密钥对加密后的信息进行解密。
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

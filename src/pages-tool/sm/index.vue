<script lang="ts" setup>
import { sm2 } from 'sm-crypto'

definePage({
  style: { navigationBarTitleText: '国密 SM2' },
})

const cipherMode = ref<0 | 1>(1)
const publicKey = ref('')
const privateKey = ref('')
const plaintext = ref('')
const ciphertext = ref('')

function createKey() {
  const keypair = sm2.generateKeyPairHex()
  publicKey.value = keypair.publicKey
  privateKey.value = keypair.privateKey
}

function encryptText() {
  if (!publicKey.value || !plaintext.value) {
    uni.showToast({ title: '请填写公钥与原文', icon: 'none' })
    return
  }
  ciphertext.value = sm2.doEncrypt(plaintext.value, publicKey.value, cipherMode.value)
}

function decryptText() {
  if (!privateKey.value || !ciphertext.value) {
    uni.showToast({ title: '请填写私钥与密文', icon: 'none' })
    return
  }
  try {
    plaintext.value = sm2.doDecrypt(ciphertext.value, privateKey.value, cipherMode.value)
  }
  catch {
    uni.showToast({ title: '解密失败', icon: 'none' })
  }
}

onMounted(createKey)
</script>

<template>
  <scroll-view scroll-y class="sm-page cyber-page-grid u-page-scroll u-page-body py-4">
    <view class="u-gap-2 mb-3 flex">
      <wd-button size="small" :type="cipherMode === 1 ? 'primary' : undefined" @click="cipherMode = 1">
        C1C3C2
      </wd-button>
      <wd-button size="small" :type="cipherMode === 0 ? 'primary' : undefined" @click="cipherMode = 0">
        C1C2C3
      </wd-button>
      <wd-button size="small" @click="createKey">
        生成密钥对
      </wd-button>
    </view>
    <wd-textarea v-model="publicKey" label="公钥" />
    <wd-textarea v-model="privateKey" label="私钥" class="mt-3" />
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
  </scroll-view>
</template>

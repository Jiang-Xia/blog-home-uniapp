<script lang="ts" setup>
import JSEncrypt from 'jsencrypt'
import { rsaDecrypt, rsaEncrypt } from '@/utils/rsa'

definePage({
  style: { navigationBarTitleText: 'RSA 加解密' },
})

const outputType = ref<'Hex' | 'Base64'>('Hex')
const publicKey = ref('')
const privateKey = ref('')
const plaintext = ref('')
const ciphertext = ref('')

function createKey() {
  const crypt = new JSEncrypt({ default_key_size: '1024' })
  crypt.getKey()
  publicKey.value = crypt.getPublicKey()
  privateKey.value = crypt.getPrivateKey()
}

function encryptText() {
  if (!publicKey.value) {
    uni.showToast({ title: '请先填写公钥', icon: 'none' })
    return
  }
  if (!plaintext.value) {
    uni.showToast({ title: '请输入原文', icon: 'none' })
    return
  }
  ciphertext.value = rsaEncrypt(plaintext.value, publicKey.value, outputType.value)
}

function decryptText() {
  if (!privateKey.value) {
    uni.showToast({ title: '请先填写私钥', icon: 'none' })
    return
  }
  if (!ciphertext.value) {
    uni.showToast({ title: '请输入密文', icon: 'none' })
    return
  }
  const result = rsaDecrypt(ciphertext.value, privateKey.value, outputType.value)
  if (!result) {
    uni.showToast({ title: '解密失败', icon: 'none' })
    return
  }
  plaintext.value = result
}

function copyText(text: string) {
  uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制', icon: 'success' }) })
}

onMounted(createKey)
</script>

<template>
  <scroll-view scroll-y class="rsa-page cyber-page-grid u-page-scroll u-page-body py-4">
    <cyber-card class="cyber-card-pad-sm">
      <view class="u-gap-2 mb-3 flex flex-wrap">
        <wd-button size="small" :type="outputType === 'Hex' ? 'primary' : undefined" @click="outputType = 'Hex'">
          Hex
        </wd-button>
        <wd-button size="small" :type="outputType === 'Base64' ? 'primary' : undefined" @click="outputType = 'Base64'">
          Base64
        </wd-button>
        <wd-button size="small" @click="createKey">
          生成密钥对
        </wd-button>
      </view>
      <wd-textarea v-model="publicKey" label="公钥" placeholder="-----BEGIN PUBLIC KEY-----" />
      <wd-textarea v-model="privateKey" label="私钥" placeholder="-----BEGIN RSA PRIVATE KEY-----" class="mt-3" />
      <wd-textarea v-model="plaintext" label="原文" placeholder="待加密文本" class="mt-3" />
      <wd-textarea v-model="ciphertext" label="密文" placeholder="加密结果 / 待解密文本" class="mt-3" />
      <view class="u-gap-2 mt-4 flex flex-wrap">
        <wd-button size="small" @click="encryptText">
          加密 →
        </wd-button>
        <wd-button size="small" @click="decryptText">
          ← 解密
        </wd-button>
        <wd-button size="small" @click="copyText(ciphertext)">
          复制密文
        </wd-button>
      </view>
    </cyber-card>
  </scroll-view>
</template>

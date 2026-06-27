<script setup lang="ts">
/**
 * 非对称密钥对面板 — 对齐 Nuxt CryptoKeyPairPanel
 */
withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})

const privateKey = defineModel<string>('privateKey', { default: '' })
const publicKey = defineModel<string>('publicKey', { default: '' })

function copyText(text: string) {
  if (!text)
    return
  uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制', icon: 'success' }) })
}
</script>

<template>
  <tool-section-header label="KEY PAIR">
    <view class="cyber-glass-card p-3">
      <view class="u-gap-2 mb-3 flex flex-wrap items-end">
        <slot name="toolbar" />
      </view>
      <view class="u-grid-2">
        <view class="cyber-crypto-panel u-stack-2">
          <view class="border-b border-tech px-3 py-2">
            <text class="text-sm text-tech font-medium">私钥 (Private Key)</text>
          </view>
          <wd-textarea v-model="privateKey" placeholder="Private Key" />
          <view>
            <wd-button size="small" @click="copyText(privateKey)">
              复制私钥
            </wd-button>
          </view>
        </view>
        <view class="cyber-crypto-panel u-stack-2">
          <view class="border-b border-tech px-3 py-2">
            <text class="text-sm text-tech font-medium">公钥 (Public Key)</text>
          </view>
          <wd-textarea v-model="publicKey" placeholder="Public Key" />
          <view>
            <wd-button size="small" @click="copyText(publicKey)">
              复制公钥
            </wd-button>
          </view>
        </view>
      </view>
    </view>
  </tool-section-header>
</template>

<style scoped>
.border-tech {
  border-color: var(--tech-border, rgba(255, 255, 255, 0.12));
}
</style>

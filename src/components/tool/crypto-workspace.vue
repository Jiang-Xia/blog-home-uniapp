<script setup lang="ts">
/** 加解密工作区 — 对齐 Nuxt CryptoWorkspace */
withDefaults(defineProps<{
  inputLabel?: string
  outputLabel?: string
  inputPlaceholder?: string
  outputPlaceholder?: string
}>(), {
  inputLabel: '原文',
  outputLabel: '密文',
  inputPlaceholder: '输入待加密的原文...',
  outputPlaceholder: '加密结果将显示在这里...',
})

const input = defineModel<string>('input', { default: '' })
const output = defineModel<string>('output', { default: '' })
</script>

<template>
  <view class="u-stack-4">
    <view class="cyber-crypto-panel u-stack-2">
      <view class="flex items-center justify-between border-b border-tech px-3 py-2">
        <text class="text-sm text-tech font-medium">{{ inputLabel }}</text>
        <text class="text-xs text-tech-subtle">{{ input.length }} chars</text>
      </view>
      <wd-textarea v-model="input" :placeholder="inputPlaceholder" />
    </view>

    <view class="crypto-action-stack u-gap-2 flex flex-wrap justify-center p-3">
      <slot name="actions" />
    </view>

    <view class="cyber-crypto-panel u-stack-2">
      <view class="flex items-center justify-between border-b border-tech px-3 py-2">
        <text class="text-sm text-tech font-medium">{{ outputLabel }}</text>
        <text class="text-xs text-tech-subtle">{{ output.length }} chars</text>
      </view>
      <wd-textarea v-model="output" :placeholder="outputPlaceholder" />
    </view>
  </view>
</template>

<style scoped>
.border-tech {
  border-color: var(--tech-border, rgba(255, 255, 255, 0.12));
}
.crypto-action-stack {
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  background: var(--tech-shell-header, rgba(255, 255, 255, 0.04));
}
</style>

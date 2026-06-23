<script lang="ts" setup>
defineProps<{
  buffs: any[]
}>()

defineEmits<{
  toggle: [buff: any]
}>()
</script>

<template>
  <view v-if="buffs.length" class="buff-list mt-4">
    <text class="mb-2 block text-tech font-medium">增益</text>
    <view v-for="b in buffs" :key="b.id" class="cyber-glass-card mb-2 flex items-center justify-between p-3">
      <view>
        <text class="block text-sm text-tech font-medium">{{ b.name }}</text>
        <text class="text-xs text-tech-muted">{{ b.description }}</text>
      </view>
      <wd-button size="small" @click="$emit('toggle', b)">
        {{ b.isActive ? '关闭' : '激活' }}
      </wd-button>
    </view>
  </view>
</template>

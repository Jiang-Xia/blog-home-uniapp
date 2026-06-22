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
    <text class="mb-2 block font-medium">增益</text>
    <view v-for="b in buffs" :key="b.id" class="mb-2 flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
      <view>
        <text class="block text-sm font-medium">{{ b.name }}</text>
        <text class="text-xs text-gray-500">{{ b.description }}</text>
      </view>
      <wd-button size="small" @click="$emit('toggle', b)">
        {{ b.isActive ? '关闭' : '激活' }}
      </wd-button>
    </view>
  </view>
</template>

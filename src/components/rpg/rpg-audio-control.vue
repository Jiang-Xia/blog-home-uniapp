<script lang="ts" setup>
import { useRpgAudio } from '@/composables/use-rpg-audio'

const { muted, toggleMute } = useRpgAudio()
</script>

<template>
  <view class="inline-flex items-center rounded-full bg-white/80 px-2 py-1 shadow-sm" @click="toggleMute">
    <text class="text-xs">{{ muted ? '🔇' : '🔊' }}</text>
  </view>
</template>

<script lang="ts" setup>
import { useRpgAudio } from '@/composables/use-rpg-audio'

const { muted, toggleMute } = useRpgAudio()
</script>

<template>
  <view class="inline-flex items-center border border-tech rounded-full bg-[rgba(17,24,39,0.72)] px-2 py-1" @click="toggleMute">
    <text class="text-xs">{{ muted ? '🔇' : '🔊' }}</text>
  </view>
</template>

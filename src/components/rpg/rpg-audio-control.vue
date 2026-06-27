<script lang="ts" setup>
/**
 * 冒险页/全站 RPG 音频控制（静音 + SFX/BGM 音量滑条）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

defineProps<{
  showVolume?: boolean
}>()

const { muted, toggleMute, sfxVolume, bgmVolume } = useRpgAudio()
</script>

<template>
  <view class="audio-control">
    <view class="mute-btn" @click="toggleMute">
      <text class="text-xs">{{ muted ? '🔇' : '🔊' }}</text>
    </view>
    <view v-if="showVolume && !muted" class="volume-sliders">
      <view class="slider-row">
        <text class="slider-label">音效</text>
        <slider
          :value="sfxVolume * 100"
          :min="0"
          :max="100"
          active-color="#a78bfa"
          :block-size="12"
          @changing="(e: any) => sfxVolume = e.detail.value / 100"
        />
      </view>
      <view class="slider-row">
        <text class="slider-label">BGM</text>
        <slider
          :value="bgmVolume * 100"
          :min="0"
          :max="100"
          active-color="#fbbf24"
          :block-size="12"
          @changing="(e: any) => bgmVolume = e.detail.value / 100"
        />
      </view>
    </view>
  </view>
</template>

<style scoped>
.audio-control {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.mute-btn {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.72);
  padding: 4px 8px;
}
.volume-sliders {
  margin-top: 6px;
  width: 140px;
}
.slider-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
}
.slider-label {
  font-size: 10px;
  color: rgba(226, 232, 240, 0.55);
  width: 28px;
  flex-shrink: 0;
}
.slider-row slider {
  flex: 1;
}
</style>

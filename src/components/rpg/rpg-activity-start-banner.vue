<script lang="ts" setup>
/**
 * 活动开始顶部横幅（activityUpdate WS，type === 'start'）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  visible: boolean
  activityName: string
  subtitle?: string
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

let dismissTimer: ReturnType<typeof setTimeout> | null = null

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function dismiss() {
  clearDismissTimer()
  emit('close')
}

watch(
  () => props.visible,
  (v) => {
    clearDismissTimer()
    if (!v || !props.activityName)
      return
    playSfx('uiClick')
    dismissTimer = setTimeout(dismiss, 4800)
  },
)

onUnmounted(clearDismissTimer)
</script>

<template>
  <view
    v-if="visible && activityName"
    class="activity-start-banner"
    @click="dismiss"
  >
    <cyber-card class="banner-card cyber-card-pad-sm u-flex-row-center">
      <text class="banner-icon">🎪</text>
      <view class="banner-body">
        <text class="banner-kicker">活动开始</text>
        <text class="banner-title">{{ activityName }}</text>
        <text v-if="subtitle" class="banner-sub">{{ subtitle }}</text>
      </view>
      <text class="banner-close" @click.stop="dismiss">✕</text>
    </cyber-card>
  </view>
</template>

<style scoped>
.activity-start-banner {
  position: fixed;
  top: 72px;
  left: 50%;
  z-index: 50;
  width: calc(100% - 24px);
  max-width: 448px;
  transform: translateX(-50%);
}

.banner-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.banner-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  margin-right: 12px;
  animation: bannerPulse 1.2s ease infinite;
}

.banner-body {
  flex: 1;
  min-width: 0;
}

.banner-kicker {
  display: block;
  font-size: 11px;
  color: rgba(96, 165, 250, 0.85);
  font-weight: 700;
}

.banner-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #e2e8f0;
}

.banner-sub {
  display: block;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.55);
  margin-top: 2px;
}

.banner-close {
  font-size: 14px;
  color: rgba(226, 232, 240, 0.45);
  margin-left: 8px;
  padding: 4px;
}

@keyframes bannerPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>

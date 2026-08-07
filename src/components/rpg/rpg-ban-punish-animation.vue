<script lang="ts" setup>
/**
 * 禁言处罚全屏警示（banStatus WS，banned === true）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { formatDateMinute } from '@/utils/date-time'

const props = defineProps<{
  visible: boolean
  banReason?: string
  banEndTime?: string | null
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

watch(
  () => props.visible,
  (v) => {
    if (v)
      playSfx('uiClick')
  },
)

const banEndText = computed(() => {
  if (!props.banEndTime)
    return ''
  return formatDateMinute(props.banEndTime)
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <view
    v-if="visible"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view class="ban-vignette" />
    <view class="ban-bars">
      <view v-for="i in 7" :key="i" class="bar" :style="{ animationDelay: `${i * 0.06}s` }" />
    </view>

    <view @click.stop>
      <cyber-card class="ban-modal rpg-modal-glass cyber-card-pad-xl text-center">
        <text class="ban-stamp">处罚</text>
        <text class="ban-icon">🔇</text>
        <text class="ban-title">您已被禁言</text>
        <text v-if="banReason" class="ban-reason">原因：{{ banReason }}</text>
        <text v-if="banEndText" class="ban-end">预计解封：{{ banEndText }}</text>
        <text class="ban-tip">禁言期间无法签到、评论、留言和回复</text>
        <wd-button @click="handleClose">
          我知道了
        </wd-button>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.rpg-anim-overlay {
  overflow: hidden;
}

.ban-vignette {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: radial-gradient(ellipse at center, transparent 35%, rgba(69, 10, 10, 0.55) 100%);
  pointer-events: none;
  animation: vignettePulse 1.2s ease-out forwards;
}

.ban-bars {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  pointer-events: none;
  opacity: 0.35;
}

.bar {
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(239, 68, 68, 0.5) 20%,
    rgba(127, 29, 29, 0.7) 50%,
    rgba(239, 68, 68, 0.5) 80%,
    transparent 100%
  );
  animation: barScan 0.9s ease-out forwards;
}

.ban-modal {
  position: relative;
  z-index: 2;
  width: calc(100% - 32px);
  max-width: 352px;
  border-color: rgba(239, 68, 68, 0.55);
  animation: modalSlam 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.ban-stamp {
  position: absolute;
  top: 12px;
  right: 14px;
  padding: 4px 10px;
  border: 2px solid rgba(239, 68, 68, 0.7);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 12px;
  font-weight: 900;
  transform: rotate(-12deg);
}

.ban-icon {
  display: block;
  font-size: 56px;
  line-height: 1;
  margin-bottom: 10px;
  animation: iconMute 1.4s ease-in-out infinite;
}

.ban-title {
  display: block;
  font-size: 22px;
  font-weight: 900;
  color: #fecaca;
  margin-bottom: 12px;
}

.ban-reason {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #f87171;
  margin-bottom: 8px;
}

.ban-end {
  display: block;
  font-size: 13px;
  color: #d6d3d1;
  margin-bottom: 8px;
}

.ban-tip {
  display: block;
  font-size: 12px;
  color: #a8a29e;
  margin-bottom: 20px;
  line-height: 1.5;
}

@keyframes vignettePulse {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0.85;
  }
}

@keyframes barScan {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes modalSlam {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes iconMute {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.94);
  }
}
</style>

<script lang="ts" setup>
/**
 * 神作晋升全屏弹窗（masterpiece WS）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  visible: boolean
  articleTitle: string
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

watch(
  () => props.visible,
  (v) => {
    if (v && props.articleTitle)
      playSfx('achievement')
  },
)

function handleClose() {
  emit('close')
}
</script>

<template>
  <view
    v-if="visible && articleTitle"
    class="rpg-anim-overlay u-overlay masterpiece-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view @click.stop>
      <view class="masterpiece-modal">
        <text class="masterpiece-icon">✨</text>
        <text class="masterpiece-badge">神作诞生</text>
        <text class="masterpiece-title">{{ articleTitle }}</text>
        <text class="masterpiece-desc">你的文章已晋升神作，继续创作吧！</text>
        <wd-button @click="handleClose">
          太棒了！
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.masterpiece-modal {
  min-width: 280px;
  max-width: 380px;
  padding: 28px 24px 24px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%);
  animation: modalGlow 2.2s ease-in-out infinite;
}

.masterpiece-icon {
  display: block;
  font-size: 50px;
  line-height: 1;
  margin-bottom: 6px;
  animation: sparkleSpin 2.4s ease-in-out infinite;
}

.masterpiece-badge {
  display: block;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #92400e;
  margin-bottom: 14px;
  animation: badgePulse 1.15s ease infinite;
}

.masterpiece-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #78350f;
  margin-bottom: 12px;
  line-height: 1.4;
}

.masterpiece-desc {
  display: block;
  font-size: 14px;
  color: #92400e;
  margin-bottom: 22px;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes sparkleSpin {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.1);
  }
}

@keyframes modalGlow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.96;
  }
}
</style>

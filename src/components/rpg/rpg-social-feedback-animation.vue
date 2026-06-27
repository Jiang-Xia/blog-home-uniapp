<script lang="ts" setup>
/**
 * 社交互动 / 打赏收方全屏弹框（socialReceived、tipReceived WS）
 */
import type { RpgSocialFeedbackData } from '@/types/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  visible: boolean
  feedback: RpgSocialFeedbackData | null
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

function handleClose() {
  emit('close')
}

const badgeText = computed(() => {
  switch (props.feedback?.kind) {
    case 'cheer': return '收到加油'
    case 'egg': return '收到鸡蛋'
    case 'flower': return '收到鲜花'
    case 'tip': return '收到打赏'
    default: return '收到互动'
  }
})

const icon = computed(() => {
  switch (props.feedback?.kind) {
    case 'cheer': return '💪'
    case 'egg': return '🥚'
    case 'flower': return '🌸'
    case 'tip': return '💎'
    default: return '✨'
  }
})

const titleText = computed(() => {
  if (!props.feedback)
    return ''
  const from = props.feedback.fromNickname || '冒险者'
  switch (props.feedback.kind) {
    case 'cheer': return `${from} 给你加油了！`
    case 'egg': return `${from} 向你扔了鸡蛋！`
    case 'flower': return `${from} 向你送了鲜花！`
    case 'tip': return `${from} 打赏了你！`
    default: return `${from} 与你互动`
  }
})

const detailText = computed(() => {
  if (!props.feedback)
    return ''
  switch (props.feedback.kind) {
    case 'cheer':
      return props.feedback.hpDelta ? `HP +${Math.abs(props.feedback.hpDelta)}` : ''
    case 'egg':
      return props.feedback.hpDelta ? `HP ${props.feedback.hpDelta}` : ''
    case 'flower':
      return props.feedback.reputationDelta ? `声望 +${props.feedback.reputationDelta}` : ''
    case 'tip':
      return [
        props.feedback.amount ? `+${props.feedback.amount} 钻石` : '',
        props.feedback.articleTitle ? `《${props.feedback.articleTitle}》` : '',
      ].filter(Boolean).join(' · ')
    default:
      return ''
  }
})

const themeClass = computed(() => {
  switch (props.feedback?.kind) {
    case 'cheer': return 'theme-cheer'
    case 'egg': return 'theme-egg'
    case 'flower': return 'theme-flower'
    case 'tip': return 'theme-tip'
    default: return 'theme-cheer'
  }
})
</script>

<template>
  <view
    v-if="visible && feedback"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view @click.stop>
      <cyber-card class="social-modal cyber-card-pad-xl text-center" :class="themeClass">
        <text class="feedback-icon">{{ icon }}</text>
        <text class="feedback-badge">{{ badgeText }}</text>
        <text class="feedback-title">{{ titleText }}</text>
        <text v-if="detailText" class="feedback-detail">{{ detailText }}</text>
        <wd-button @click="handleClose">
          知道了
        </wd-button>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.rpg-anim-overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.72);
}

.social-modal {
  min-width: 280px;
  max-width: 380px;
}

.theme-cheer {
  border-color: rgba(59, 130, 246, 0.45);
}

.theme-egg {
  border-color: rgba(245, 158, 11, 0.45);
}

.theme-flower {
  border-color: rgba(236, 72, 153, 0.45);
}

.theme-tip {
  border-color: rgba(139, 92, 246, 0.45);
}

.feedback-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 8px;
  animation: bounce 0.8s ease infinite;
}

.feedback-badge {
  display: block;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.85;
  margin-bottom: 10px;
  color: rgba(226, 232, 240, 0.75);
}

.feedback-title {
  display: block;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.35;
  margin-bottom: 8px;
  color: #fde68a;
}

.feedback-detail {
  display: block;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fbbf24;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.08);
  }
}
</style>

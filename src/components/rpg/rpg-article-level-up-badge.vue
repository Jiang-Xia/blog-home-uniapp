<script lang="ts" setup>
/**
 * 文章升级顶部徽章（articleLevelUp WS，非全屏）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'

export interface ArticleLevelUpData {
  articleId: number
  articleTitle: string
  oldLevel: number
  newLevel: number
}

const props = defineProps<{
  visible: boolean
  data: ArticleLevelUpData | null
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

let dismissTimer: ReturnType<typeof setTimeout> | null = null

const titleText = computed(() => props.data?.articleTitle || '文章')

const levelText = computed(() => {
  if (!props.data)
    return ''
  return `Lv${props.data.oldLevel} → Lv${props.data.newLevel}`
})

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
    if (!v || !props.data)
      return
    playSfx('questComplete')
    dismissTimer = setTimeout(dismiss, 3600)
  },
)

onUnmounted(clearDismissTimer)
</script>

<template>
  <view
    v-if="visible && data"
    class="article-level-badge"
    @click="dismiss"
  >
    <cyber-card class="badge-card cyber-card-pad-sm u-flex-row-center">
      <text class="badge-icon">📈</text>
      <view class="badge-body">
        <text class="badge-kicker">文章升级</text>
        <text class="badge-title">{{ titleText }}</text>
        <text class="badge-level">{{ levelText }}</text>
      </view>
    </cyber-card>
  </view>
</template>

<style scoped>
.article-level-badge {
  position: fixed;
  top: 72px;
  right: 12px;
  z-index: 50;
  width: calc(100% - 24px);
  max-width: 320px;
}

.badge-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.badge-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  margin-right: 12px;
  animation: iconRise 0.7s ease infinite alternate;
}

.badge-body {
  flex: 1;
  min-width: 0;
}

.badge-kicker {
  display: block;
  font-size: 11px;
  color: rgba(96, 165, 250, 0.85);
  font-weight: 700;
}

.badge-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-level {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.75);
  margin-top: 2px;
}

@keyframes iconRise {
  from {
    transform: translateY(2px);
  }
  to {
    transform: translateY(-4px);
  }
}
</style>

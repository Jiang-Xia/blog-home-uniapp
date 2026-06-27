<script lang="ts" setup>
/**
 * 成就达成全屏弹窗（WS achievementUnlocked）
 */
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { resolveRarityDisplayColor } from '@/utils/rpg-rarity'

const props = defineProps<{
  visible: boolean
  name: string
  expReward?: number
  rarityColor?: string
  rarityLabel?: string
  rarityIcon?: string
}>()

const emit = defineEmits<{ close: [] }>()

const { playSfx } = useRpgAudio()

const iconStyle = computed(() => ({
  background: resolveRarityDisplayColor({
    rarityColor: props.rarityColor,
    rarityLabel: props.rarityLabel,
  }),
}))

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
</script>

<template>
  <view
    v-if="visible"
    class="rpg-anim-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @click="handleClose"
  >
    <view @click.stop>
      <cyber-card class="achievement-modal cyber-card-pad-xl text-center">
        <view class="achievement-icon" :style="iconStyle">
          <text class="achievement-icon-text">{{ rarityIcon || '🏆' }}</text>
        </view>
        <text class="achievement-badge">成就达成</text>
        <text class="achievement-name">{{ name }}</text>
        <text v-if="expReward" class="achievement-reward">+{{ expReward }} EXP</text>
        <wd-button @click="handleClose">
          太棒了！
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

.achievement-modal {
  min-width: 280px;
  max-width: 380px;
  animation: modalGlow 2.4s ease-in-out infinite;
}

.achievement-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconBounce 0.9s ease infinite;
}

.achievement-icon-text {
  font-size: 28px;
}

.achievement-badge {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 12px;
  letter-spacing: 0.12em;
}

.achievement-name {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #fde68a;
  margin-bottom: 10px;
  line-height: 1.35;
}

.achievement-reward {
  display: block;
  font-size: 17px;
  font-weight: 800;
  color: #f59e0b;
  margin-bottom: 22px;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.1);
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

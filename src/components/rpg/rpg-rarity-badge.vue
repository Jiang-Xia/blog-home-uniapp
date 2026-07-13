<script lang="ts" setup>
/**
 * 稀有度徽章（对齐 blog-home-nuxt RpgRarityBadge）
 * 展示字段来自 API 的 rarityLabel / rarityColor / rarityIcon
 */
import type { RarityDisplayFields } from '@/types/rpg'
import { getRarityBadgePresentation, resolveRarityDisplayFields } from '@/utils/rpg-rarity'

const props = defineProps<RarityDisplayFields>()

const display = computed(() => resolveRarityDisplayFields(props))
const badgePresentation = computed(() => getRarityBadgePresentation(display.value))
</script>

<template>
  <view
    v-if="display.rarity || display.rarityLabel"
    class="rpg-rarity-badge"
    :class="badgePresentation.class"
    :style="badgePresentation.style"
  >
    <text v-if="display.rarityIcon" class="rpg-rarity-badge__icon">{{ display.rarityIcon }}</text>
    <text class="rpg-rarity-badge__label">{{ display.rarityLabel || display.rarity }}</text>
  </view>
</template>

<style scoped>
.rpg-rarity-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  width: auto;
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  box-sizing: border-box;
}

.rpg-rarity-badge__icon {
  margin-right: 2px;
  font-size: 10px;
  line-height: 1.3;
}

.rpg-rarity-badge__label {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.rpg-rarity-badge--common {
  color: #c8d4e0;
  border-color: rgba(200, 212, 224, 0.45);
  background: rgba(200, 212, 224, 0.12);
}

.rpg-rarity-badge--rare {
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.45);
  background: rgba(34, 197, 94, 0.12);
}

.rpg-rarity-badge--epic {
  color: #c4b5fd;
  border-color: rgba(139, 92, 246, 0.45);
  background: rgba(139, 92, 246, 0.12);
}

.rpg-rarity-badge--legendary {
  color: #fcd34d;
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.12);
}
</style>

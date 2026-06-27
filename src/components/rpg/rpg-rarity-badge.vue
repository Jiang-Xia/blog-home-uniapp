<script lang="ts" setup>
/**
 * 稀有度徽章（对齐 blog-home-nuxt RpgRarityBadge）
 * 展示字段来自 API 的 rarityLabel / rarityColor / rarityIcon
 */
import type { RarityDisplayFields } from '@/types/rpg'
import { getRarityBadgePresentation } from '@/utils/rpg-rarity'

const props = defineProps<RarityDisplayFields>()

const badgePresentation = computed(() => getRarityBadgePresentation(props))
</script>

<template>
  <text
    v-if="rarity || rarityLabel"
    class="rpg-rarity-badge"
    :class="badgePresentation.class"
    :style="badgePresentation.style"
  >
    <text v-if="rarityIcon">{{ rarityIcon }} </text>
    {{ rarityLabel || rarity }}
  </text>
</template>

<style scoped>
.rpg-rarity-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
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

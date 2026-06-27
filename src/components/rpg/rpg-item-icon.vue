<script lang="ts" setup>
/**
 * RPG 物品图标（对齐 blog-home-nuxt RpgItemIcon）
 * API iconUrl → static/rpg/icons → emoji；展示字段来自后端 enrich
 */
import { buildRpgItemAssetCandidates, resolveRpgItemBgUrl } from '@/utils/rpg-item-asset'
import {
  resolveRpgItemEmoji,
  resolveRpgItemTint,

} from '@/utils/rpg-item-icon'
import type { RpgItemIconSource } from '@/utils/rpg-item-icon'
import { isSilverRarityColor } from '@/utils/rpg-rarity'

const props = withDefaults(
  defineProps<{
    icon?: string | null
    iconUrl?: string | null
    bgUrl?: string | null
    itemTypeIcon?: string | null
    rarityColor?: string | null
    frameColor?: string | null
    tinted?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { tinted: true, size: 'md' },
)

const iconSource = computed(
  () =>
    ({
      icon: props.icon,
      itemTypeIcon: props.itemTypeIcon,
    }) satisfies RpgItemIconSource,
)

const assetCandidates = computed(() =>
  buildRpgItemAssetCandidates(iconSource.value, {
    iconUrl: props.iconUrl,
    bgUrl: props.bgUrl,
  }),
)

const candidateIndex = ref(0)
const useEmoji = ref(false)

watch(
  assetCandidates,
  () => {
    candidateIndex.value = 0
    useEmoji.value = assetCandidates.value.length === 0
  },
  { immediate: true },
)

const currentSrc = computed(() => {
  if (useEmoji.value)
    return ''
  return assetCandidates.value[candidateIndex.value] ?? ''
})

const emoji = computed(() => resolveRpgItemEmoji(iconSource.value))

const isSilverTint = computed(() => {
  if (!props.tinted || props.bgUrl)
    return false
  const tintColor = props.rarityColor || props.frameColor
  return isSilverRarityColor(tintColor)
})

const containerStyle = computed(() => {
  const bgImage = resolveRpgItemBgUrl(props.bgUrl)
  if (bgImage) {
    return {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  if (!props.tinted || isSilverTint.value)
    return undefined
  const bg = resolveRpgItemTint({
    rarityColor: props.rarityColor,
    color: props.frameColor,
  })
  if (!bg)
    return undefined
  return { background: bg }
})

const isTinted = computed(
  () => props.tinted && (!!containerStyle.value || isSilverTint.value) && !props.bgUrl,
)

/** 当前候选加载失败，尝试下一格式或回退 emoji */
function onImgError() {
  if (candidateIndex.value < assetCandidates.value.length - 1) {
    candidateIndex.value += 1
    return
  }
  useEmoji.value = true
}
</script>

<template>
  <view
    class="rpg-item-icon"
    :class="[
      size === 'sm' ? 'rpg-item-icon--sm' : '',
      size === 'lg' ? 'rpg-item-icon--lg' : '',
      isTinted && !isSilverTint ? 'rpg-item-icon--tinted' : '',
      isSilverTint ? 'rpg-item-icon--silver' : '',
      currentSrc ? 'rpg-item-icon--asset' : '',
      bgUrl ? 'rpg-item-icon--bg' : '',
    ]"
    :style="containerStyle"
  >
    <image
      v-if="currentSrc"
      :key="currentSrc"
      :src="currentSrc"
      class="rpg-item-icon__img"
      mode="aspectFit"
      @error="onImgError"
    />
    <text v-else class="rpg-item-icon__emoji">{{ emoji }}</text>
  </view>
</template>

<style scoped>
.rpg-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  flex-shrink: 0;
}

.rpg-item-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.rpg-item-icon--lg {
  width: 52px;
  height: 52px;
  border-radius: 14px;
}

.rpg-item-icon--asset {
  color: #fff;
}

.rpg-item-icon--bg {
  border-color: rgba(255, 255, 255, 0.2);
}

.rpg-item-icon--silver {
  background: linear-gradient(145deg, #e8eef4 0%, #c8d4e0 55%, #a8b4c0 100%);
}

.rpg-item-icon__img {
  width: 72%;
  height: 72%;
}

.rpg-item-icon--lg .rpg-item-icon__img {
  width: 78%;
  height: 78%;
}

.rpg-item-icon--sm .rpg-item-icon__img {
  width: 68%;
  height: 68%;
}

.rpg-item-icon__emoji {
  font-size: 20px;
  line-height: 1;
}

.rpg-item-icon--sm .rpg-item-icon__emoji {
  font-size: 14px;
}

.rpg-item-icon--lg .rpg-item-icon__emoji {
  font-size: 28px;
}
</style>

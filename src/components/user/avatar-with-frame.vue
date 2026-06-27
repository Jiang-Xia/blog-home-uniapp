<script lang="ts" setup>
/**
 * 带 RPG 头像框的圆形头像（对齐 blog-home-nuxt CommonAvatarWithFrame）
 */
import type { AvatarFrameInfo } from '@/types/rpg'

const props = withDefaults(defineProps<{
  avatar?: string
  alt?: string
  /** 尺寸，单位 rpx */
  size?: number
  frame?: AvatarFrameInfo | null
  /** 点击头像预览大图 */
  previewable?: boolean
}>(), {
  avatar: '',
  alt: '',
  size: 64,
  previewable: false,
})

const frameColor = computed(() => props.frame?.color || null)

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
  }
  if (frameColor.value)
    style.borderColor = frameColor.value
  return style
})

function onAvatarClick() {
  if (!props.previewable || !props.avatar)
    return
  uni.previewImage({ urls: [props.avatar], current: props.avatar })
}
</script>

<template>
  <view
    class="avatar-with-frame shrink-0"
    :class="frameColor ? 'avatar-with-frame--framed' : ''"
    :style="wrapperStyle"
    @click="onAvatarClick"
  >
    <image
      v-if="avatar"
      :src="avatar"
      class="avatar-with-frame__img"
      mode="aspectFill"
    />
    <view v-else class="avatar-with-frame__fallback">
      <slot name="fallback">
        <text class="avatar-with-frame__fallback-text">{{ alt?.charAt(0) || '?' }}</text>
      </slot>
    </view>
  </view>
</template>

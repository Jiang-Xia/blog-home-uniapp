<script setup lang="ts">
/**
 * 项目彩色 SVG 图标（构建时 data URI 内联，MP/H5 均可用 image 渲染）
 * - MP 须 virtualHost，否则 app.wxss 尺寸样式无法作用到 image
 * - 未传 size 时 100% 填满父级图标盒（父级须有宽高，如 cyber-cell-icon）
 */
import type { AppIconName } from '@/config/app-icons'
import { getAppIconSrc } from '@/config/app-icon-urls'

defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

const props = defineProps<{
  name: AppIconName
  /** 固定尺寸；省略则 100% 填满父级图标盒 */
  size?: string
}>()

const iconSrc = computed(() => getAppIconSrc(props.name))

const iconStyle = computed(() => {
  if (props.size)
    return { width: props.size, height: props.size }
  return { width: '100%', height: '100%' }
})
</script>

<template>
  <image
    class="cyber-icon"
    :src="iconSrc"
    mode="aspectFit"
    :style="iconStyle"
  />
</template>

<style lang="scss">
.cyber-icon {
  display: block;
  flex-shrink: 0;
  line-height: 0;
}
</style>

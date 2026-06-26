<script setup lang="ts">
/**
 * 回到顶部浮动按钮（对齐 blog-home-nuxt xia-backtop）
 * - 父页通过 ref.onPageScroll(scrollTop) 传入滚动位置
 * - 点击 emit click，由父页执行 scrollToTop / scroll-view 回顶
 */
defineOptions({
  // #ifdef MP-WEIXIN
  virtualHost: true,
  // #endif
})

withDefaults(defineProps<{
  /** Tab 页需抬高，避免与底部 tabbar 重叠 */
  aboveTabbar?: boolean
}>(), {
  aboveTabbar: false,
})

const emit = defineEmits<{ click: [] }>()

const visible = ref(false)

/** 由父页 scroll 事件调用，scrollTop 超过阈值时显示 */
function onPageScroll(scrollTop: number) {
  visible.value = scrollTop > 320
}

defineExpose({ onPageScroll })
</script>

<template>
  <view
    v-if="visible"
    class="cyber-back-top"
    :class="aboveTabbar ? 'cyber-back-top--tabbar' : ''"
    @tap="emit('click')"
  >
    <view class="cyber-back-top-arrow" />
  </view>
</template>

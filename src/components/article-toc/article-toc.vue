<script lang="ts" setup>
/**
 * 文章目录（FAB + 半屏底部弹层，对齐 blog-home-nuxt ArticleTocDrawer）
 * - 详情页使用 scroll-view，跳转与高亮均基于 scrollTop，不用 window.scrollIntoView
 */
import type { ArticleTocItem } from '@/utils/article-toc'
import {
  calcTocTargetScrollTop,
  measureTocHeadingOffsets,
  resolveActiveTocId,
} from '@/utils/article-toc'

const props = withDefaults(defineProps<{
  topics: ArticleTocItem[]
  /** 详情 scroll-view 当前 scrollTop */
  scrollTop?: number
}>(), {
  scrollTop: 0,
})

const emit = defineEmits<{
  /** 请求父级将 scroll-view 滚到目标位置 */
  'scroll-to': [scrollTop: number]
}>()

const showPopup = ref(false)
const activeId = ref('')
const headingOffsets = ref<Record<string, number>>({})
const tocListScrollTop = ref(0)
let syncTimer: ReturnType<typeof setTimeout> | null = null

function closePopup() {
  showPopup.value = false
}

function openPopup() {
  showPopup.value = true
  void refreshHeadingOffsets()
}

function syncActiveId() {
  activeId.value = resolveActiveTocId(props.topics, props.scrollTop, headingOffsets.value)
}

function scheduleSyncActiveId() {
  if (syncTimer)
    return
  syncTimer = setTimeout(() => {
    syncTimer = null
    syncActiveId()
  }, 80)
}

/** 重新测量标题位置（目录生成后 / 打开弹层时） */
async function refreshHeadingOffsets() {
  if (!props.topics.length) {
    headingOffsets.value = {}
    activeId.value = ''
    return
  }

  await nextTick()
  headingOffsets.value = await measureTocHeadingOffsets(props.topics)
  syncActiveId()
}

async function scrollToHeading(id: string) {
  let offsets = headingOffsets.value
  if (!offsets[id])
    offsets = await measureTocHeadingOffsets(props.topics)

  const target = calcTocTargetScrollTop(id, offsets)
  if (target == null)
    return

  headingOffsets.value = offsets
  activeId.value = id
  emit('scroll-to', target)
  closePopup()
}

watch(
  () => props.topics,
  () => {
    void refreshHeadingOffsets()
  },
  { deep: true },
)

watch(
  () => props.scrollTop,
  () => {
    scheduleSyncActiveId()
  },
)

watch(activeId, () => {
  nextTick(scrollActiveItemIntoView)
})

/** 目录弹层内将当前高亮项滚入可视区 */
function scrollActiveItemIntoView() {
  if (!activeId.value || !showPopup.value)
    return

  const query = uni.createSelectorQuery()
  query.select('.article-toc-popup-scroll').scrollOffset()
  query.select('.article-toc-popup-scroll').boundingClientRect()
  query.select('.article-toc-item--active').boundingClientRect()
  query.exec((res) => {
    const containerOffset = res[0] as { scrollTop?: number } | null
    const containerRect = res[1] as UniApp.NodeInfo | null
    const activeRect = res[2] as UniApp.NodeInfo | null
    if (!containerOffset || !containerRect || !activeRect)
      return

    const currentTop = containerOffset.scrollTop ?? 0
    const containerHeight = containerRect.height ?? 0
    const relativeTop = (activeRect.top ?? 0) - (containerRect.top ?? 0) + currentTop
    const relativeBottom = relativeTop + (activeRect.height ?? 0)

    if (relativeTop < currentTop) {
      tocListScrollTop.value = relativeTop
    }
    else if (relativeBottom > currentTop + containerHeight) {
      tocListScrollTop.value = relativeBottom - containerHeight
    }
  })
}

onBeforeUnmount(() => {
  if (syncTimer)
    clearTimeout(syncTimer)
})

defineExpose({
  /** 正文渲染完成后由详情页触发，重新测量标题偏移 */
  remeasure: refreshHeadingOffsets,
})
</script>

<template>
  <view v-if="props.topics.length" class="article-toc-root">
    <view class="article-toc-fab" @tap="openPopup">
      <text class="article-toc-fab-text">目录</text>
    </view>

    <wd-popup
      v-model="showPopup"
      position="bottom"
      closable
      round
      safe-area-inset-bottom
      :root-portal="true"
      :z-index="100"
      custom-style="height: 50vh"
      @close="closePopup"
    >
      <view class="article-toc-popup">
        <view class="article-toc-popup-header">
          <text class="article-toc-popup-title text-tech font-semibold">目录 ({{ props.topics.length }})</text>
        </view>
        <scroll-view
          scroll-y
          class="article-toc-popup-scroll"
          :scroll-top="tocListScrollTop"
        >
          <view
            v-for="item in props.topics"
            :key="item.id"
            class="article-toc-item"
            :class="[
              item.level === '1' ? 'article-toc-item--h1' : 'article-toc-item--h2',
              activeId === item.id ? 'article-toc-item--active' : '',
            ]"
            @tap="scrollToHeading(item.id)"
          >
            <text>{{ item.text }}</text>
          </view>
        </scroll-view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped lang="scss">
.article-toc-fab {
  position: fixed;
  left: 24rpx;
  bottom: 200rpx;
  z-index: 39;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  border: 1px solid var(--tech-border);
  background: var(--tech-glass);
  box-shadow: 0 4rpx 16rpx var(--tech-glass-shadow);
}

.article-toc-fab:active {
  border-color: rgba(103, 232, 249, 0.35);
}

.article-toc-fab-text {
  font-size: 24rpx;
  color: var(--tech-fg-muted);
  line-height: 1;
}

.article-toc-popup {
  display: flex;
  flex-direction: column;
  height: 50vh;
  background: var(--tech-dropdown-bg, var(--tech-glass));
}

.article-toc-popup-header {
  flex-shrink: 0;
  padding: 24rpx 32rpx 16rpx;
  border-bottom: 1px solid var(--tech-border);
}

.article-toc-popup-title {
  font-size: 28rpx;
  line-height: 1.3;
}

.article-toc-popup-scroll {
  flex: 1;
  height: 0;
  padding: 8rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.article-toc-item {
  padding: 16rpx 8rpx 16rpx 16rpx;
  font-size: 26rpx;
  color: var(--tech-fg-muted);
  line-height: 1.4;
  border-left: 4rpx solid transparent;
}

.article-toc-item--h1 {
  font-weight: 600;
  color: var(--tech-primary);
}

.article-toc-item--h2 {
  padding-left: 32rpx;
  font-size: 24rpx;
}

.article-toc-item--active {
  color: var(--tech-primary);
  font-weight: 600;
  border-left-color: var(--tech-primary);
  background-color: rgba(34, 211, 238, 0.1);
}

/* #ifdef H5 */
.article-toc-fab {
  bottom: calc(200rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>

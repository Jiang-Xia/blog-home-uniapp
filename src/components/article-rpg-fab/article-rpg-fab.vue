<script lang="ts" setup>
/**
 * 文章详情浮动操作（对齐 blog-home-nuxt ArticleRpgFab）
 * - 点赞 / 收藏 / 打赏
 * - 固定于右下角，展开后显示子操作按钮
 */
import { checkCollected, checkLiked, toggleCollect, toggleLike } from '@/api/article'
import RpgArticleTip from '@/components/rpg/rpg-article-tip.vue'
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

const props = defineProps<{
  articleId: number | string
  authorUid: number
  /** 当前点赞数，用于 FAB 内 toggle 后回写 */
  likes?: number
}>()

const emit = defineEmits<{
  'tipped': []
  'update:likes': [count: number]
}>()

const tokenStore = useTokenStore()

const fabOpen = ref(false)
const liked = ref(false)
const collected = ref(false)
const collectLoading = ref(false)
const showTipPopup = ref(false)

/** 监听 scroll-view 滚动（保留 expose 供父页调用，当前 FAB 无回顶子项） */
function onPageScroll(_scrollTop: number) {
  /* noop */
}

defineExpose({ onPageScroll })

/** 加载点赞/收藏状态 */
async function loadInteractionState() {
  if (!tokenStore.hasLogin)
    return
  try {
    liked.value = (await checkLiked(props.articleId))?.liked ?? false
    collected.value = (await checkCollected(props.articleId))?.collected ?? false
  }
  catch { /* ignore */ }
}

onMounted(() => {
  void loadInteractionState()
})

watch(() => tokenStore.hasLogin, () => {
  void loadInteractionState()
})

function ensureLogin() {
  if (tokenStore.hasLogin)
    return true
  uni.navigateTo({ url: LOGIN_PAGE })
  return false
}

/** 点赞切换，同步父组件 likes 计数 */
async function handleLike() {
  if (!ensureLogin())
    return
  await toggleLike(props.articleId)
  liked.value = !liked.value
  const base = props.likes ?? 0
  emit('update:likes', liked.value ? base + 1 : Math.max(0, base - 1))
  fabOpen.value = false
}

/** 收藏切换 */
async function handleCollect() {
  if (!ensureLogin())
    return
  if (collectLoading.value)
    return
  collectLoading.value = true
  try {
    await toggleCollect(props.articleId)
    collected.value = !collected.value
    uni.showToast({ title: collected.value ? '收藏成功' : '已取消收藏', icon: 'none' })
    fabOpen.value = false
  }
  finally {
    collectLoading.value = false
  }
}

function openTipPopup() {
  if (!ensureLogin())
    return
  showTipPopup.value = true
  fabOpen.value = false
}

function onTipped() {
  showTipPopup.value = false
  emit('tipped')
}

function toggleFab() {
  fabOpen.value = !fabOpen.value
}
</script>

<template>
  <view class="article-rpg-fab-wrap">
    <view v-if="fabOpen" class="fab-actions">
      <view class="fab-action-item">
        <view class="fab-action-btn" :class="liked ? 'fab-action-btn--liked' : 'fab-action-btn--ghost'" @tap="handleLike">
          <cyber-icon v-if="liked" name="heart" size="40rpx" class="fab-action-icon" />
          <wd-icon v-else name="heart" custom-class="fab-action-icon fab-action-icon--wd" color="var(--tech-fg-muted)" />
        </view>
        <text class="fab-action-label">{{ liked ? '取消' : '点赞' }}</text>
      </view>
      <view class="fab-action-item">
        <view
          class="fab-action-btn"
          :class="collected ? 'fab-action-btn--collected' : 'fab-action-btn--ghost'"
          @tap="handleCollect"
        >
          <cyber-icon name="bookmark" size="40rpx" class="fab-action-icon" :class="collected ? '' : 'fab-action-icon--dim'" />
        </view>
        <text class="fab-action-label">{{ collected ? '已藏' : '收藏' }}</text>
      </view>
      <view class="fab-action-item">
        <view class="fab-action-btn fab-action-btn--tip" @tap="openTipPopup">
          <cyber-icon name="gem" size="40rpx" class="fab-action-icon" />
        </view>
        <text class="fab-action-label">打赏</text>
      </view>
    </view>

    <view class="fab-main-btn" @tap="toggleFab">
      <cyber-icon v-if="!fabOpen" name="sword" size="44rpx" class="fab-main-icon" />
      <wd-icon v-else name="close" custom-class="fab-main-icon fab-main-icon--wd" color="var(--tech-fg)" />
    </view>
  </view>

  <view
    v-if="showTipPopup"
    class="tip-dialog-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center"
    @tap="showTipPopup = false"
  >
    <cyber-card class="tip-dialog cyber-card-pad-xl" @tap.stop>
      <view class="tip-dialog-title u-gap-2 mb-3 flex items-center">
        <cyber-icon name="gem" size="36rpx" />
        <text class="text-lg text-tech font-bold">打赏作者</text>
      </view>
      <RpgArticleTip
        :article-id="Number(articleId)"
        :author-uid="authorUid"
        embedded
        @tipped="onTipped"
      />
      <view class="mt-4">
        <wd-button block type="info" @click="showTipPopup = false">
          关闭
        </wd-button>
      </view>
    </cyber-card>
  </view>
</template>

<style scoped>
.article-rpg-fab-wrap {
  position: fixed;
  right: 24rpx;
  bottom: 48rpx;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fab-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 16rpx;
}

.fab-action-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16rpx;
}

.fab-action-label {
  font-size: 22rpx;
  color: var(--tech-fg-muted);
  margin-right: 12rpx;
}

.fab-action-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--tech-border);
  background: var(--tech-glass);
  box-shadow: 0 4rpx 16rpx var(--tech-glass-shadow);
}

.fab-action-btn--ghost {
  background: rgba(17, 24, 39, 0.85);
}

.fab-action-btn--liked {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
}

.fab-action-btn--collected {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
}

.fab-action-btn--tip {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
}

.fab-action-btn--secondary {
  background: rgba(34, 211, 238, 0.15);
  border-color: rgba(34, 211, 238, 0.4);
}

.fab-action-icon {
  line-height: 1;
}

.fab-action-icon--dim {
  opacity: 0.55;
}

.fab-action-icon--wd {
  font-size: 32rpx !important;
}

.fab-main-icon--wd {
  font-size: 40rpx !important;
}

.fab-main-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tech-gradient-from), var(--tech-gradient-to));
  box-shadow: 0 8rpx 24rpx var(--tech-primary-glow);
  border: 2px solid rgba(34, 211, 238, 0.4);
}

.fab-main-icon {
  font-size: 40rpx;
  line-height: 1;
}

.tip-dialog-overlay {
  position: fixed;
  background: rgba(0, 0, 0, 0.6);
}

.tip-dialog {
  width: 85%;
  max-width: 360px;
}

.tip-dialog-title {
  line-height: 1.3;
}

/* #ifdef H5 */
.article-rpg-fab-wrap {
  bottom: calc(48rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>

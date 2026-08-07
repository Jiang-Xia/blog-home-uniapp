<script lang="ts" setup>
/**
 * 文章详情页
 * - 正文 MdPreview/高亮、目录、封面预览、RPG 打赏
 * - 评论 pending 时不刷新列表；本人可删除评论/回复
 * - 相关推荐/上下篇导航对齐 blog-home-nuxt
 */
import type { ArticleItem } from '@/api/article'
import {
  addComment,
  addReply,
  checkLiked,
  delComment,
  delReply,
  getArticleInfo,
  getComment,
  getRelatedArticles,
  parseArticleDetail,
  postArticleViews,
  toggleLike,
} from '@/api/article'
import ArticleAdjacentNav from '@/components/article-adjacent-nav/article-adjacent-nav.vue'
import ArticleDetailHero from '@/components/article/article-detail-hero.vue'
import ArticleRelatedList from '@/components/article-related-list/article-related-list.vue'
import ArticleRpgFab from '@/components/article-rpg-fab/article-rpg-fab.vue'
import ArticleShareBar from '@/components/article/article-share-bar.vue'
import ArticleToc from '@/components/article-toc/article-toc.vue'
import CyberBackTop from '@/components/cyber/cyber-back-top.vue'
import MarkdownView from '@/components/markdown-view/markdown-view.vue'
import RpgLevelBadge from '@/components/rpg/rpg-level-badge.vue'
import AvatarWithFrame from '@/components/user/avatar-with-frame.vue'
import { useAuthorRpgLevels } from '@/composables/use-author-rpg-levels'
import { ROUTE_DETAIL, ROUTE_USER_PUBLIC } from '@/router/routes'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import type { ArticleTocItem } from '@/utils/article-toc'
import { resolvePublicAvatarFrame } from '@/utils/avatar-frame'
import { parseCommentCreateStatus, resolveCommentUserUid } from '@/utils/comment'
import { formatRelativeTime } from '@/utils/date-time'
import { resolveStaticUrl } from '@/utils/static-url'
import { toast, toastSuccess } from '@/utils/toast'

definePage({
  style: { navigationBarTitleText: '文章详情' },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { getAuthorLevel, fetchLevelsForUids } = useAuthorRpgLevels()
const articleId = ref('')
const article = ref<Record<string, any> | null>(null)
const adjacentPrev = ref<{ id: number, title: string } | null>(null)
const adjacentNext = ref<{ id: number, title: string } | null>(null)
const relatedList = ref<ArticleItem[]>([])
const comments = ref<any[]>([])
const commentText = ref('')
const liked = ref(false)
const COMMENT_PAGE_SIZE = 20
const commentPage = ref(1)
const commentTopTotal = ref(0)
const commentsLoading = ref(false)
/** 回复弹层（底部弹出，避免 scroll-view 内输入框在小程序端失效） */
const showReplyPopup = ref(false)
const replySubmitting = ref(false)
const replyTarget = ref<{ commentId: string | number, replyUid: number, nickname: string } | null>(null)
const replyText = ref('')
const loading = ref(true)
const tocTopics = ref<ArticleTocItem[]>([])
const scrollTop = ref(0)
const scrollToTop = ref(0)
const fabRef = ref<InstanceType<typeof ArticleRpgFab> | null>(null)
const backTopRef = ref<InstanceType<typeof CyberBackTop> | null>(null)
const articleTocRef = ref<InstanceType<typeof ArticleToc> | null>(null)

const DEFAULT_AVATAR = '/static/images/default-avatar.png'

const currentUserId = computed(() => userStore.userInfo.userId)
const coverUrl = computed(() => resolveStaticUrl(String(article.value?.cover ?? '')))
const authorUid = computed(() => Number(article.value?.uid ?? article.value?.userInfo?.id ?? 0))
const authorNickname = computed(() => String(article.value?.userInfo?.nickname ?? '').trim())
const authorAvatarSrc = computed(() => {
  const av = article.value?.userInfo?.avatar
  return resolveStaticUrl(av ? String(av) : DEFAULT_AVATAR)
})
const authorAvatarFrame = computed(() =>
  resolvePublicAvatarFrame(article.value?.userInfo?.avatarFrame),
)
const showAuthor = computed(() => !!authorNickname.value || !!article.value?.userInfo?.avatar)

const authorLevel = computed(() => getAuthorLevel(authorUid.value))

/** 评论总数：优先 API 字段，否则按已加载列表估算 */
const commentTotal = computed(() => {
  const fromApi = article.value?.commentCount ?? article.value?.comments
  if (fromApi != null && fromApi !== '')
    return Number(fromApi) || 0
  let total = commentTopTotal.value
  comments.value.forEach((c) => {
    total += c.allReplyCount ?? c.replys?.length ?? c.reply?.length ?? 0
  })
  return total
})

const commentHasMore = computed(() => comments.value.length < commentTopTotal.value)

/** 加载点赞状态 */
async function loadLikeState() {
  if (!tokenStore.hasLogin || !articleId.value)
    return
  try {
    liked.value = (await checkLiked(articleId.value))?.liked ?? false
  }
  catch {
    liked.value = false
  }
}

/** Hero 区点赞切换 */
async function handleHeroLike() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  await toggleLike(articleId.value)
  liked.value = !liked.value
  if (article.value) {
    const base = Number(article.value.likes ?? 0)
    article.value.likes = liked.value ? base + 1 : Math.max(0, base - 1)
  }
}

function applyCommentList(list: any[], append: boolean) {
  comments.value = append ? [...comments.value, ...list] : list
}

/** 加载文章、评论与互动状态 */
async function loadArticle() {
  loading.value = true
  try {
    const raw = await getArticleInfo({ id: articleId.value })
    const { info, prev, next } = parseArticleDetail(raw)
    article.value = info
    adjacentPrev.value = prev
    adjacentNext.value = next
    if (article.value) {
      void postArticleViews(articleId.value)
      void fetchLevelsForUids([authorUid.value])
      const commentRes = await getComment(articleId.value, { page: 1, pageSize: COMMENT_PAGE_SIZE })
      commentPage.value = 1
      commentTopTotal.value = commentRes?.pagination?.total ?? commentRes?.list?.length ?? 0
      applyCommentList(commentRes?.list ?? [], false)
      const related = await getRelatedArticles(articleId.value)
      relatedList.value = related?.list ?? []
      await loadLikeState()
    }
  }
  finally {
    loading.value = false
  }
}

/** 追加加载更多顶层评论 */
async function loadMoreComments() {
  if (commentsLoading.value || !commentHasMore.value)
    return
  commentsLoading.value = true
  try {
    commentPage.value += 1
    const more = await getComment(articleId.value, {
      page: commentPage.value,
      pageSize: COMMENT_PAGE_SIZE,
    })
    applyCommentList(more?.list ?? [], true)
  }
  finally {
    commentsLoading.value = false
  }
}

/** 仅刷新评论列表（删除/已通过评论后） */
async function reloadComments() {
  const commentRes = await getComment(articleId.value, { page: 1, pageSize: COMMENT_PAGE_SIZE })
  commentPage.value = 1
  commentTopTotal.value = commentRes?.pagination?.total ?? commentRes?.list?.length ?? 0
  applyCommentList(commentRes?.list ?? [], false)
}

onLoad((query) => {
  articleId.value = String(query?.id ?? '')
  void loadArticle()
})

watch(() => tokenStore.hasLogin, () => {
  void loadLikeState()
})

/** scroll-view 滚动：FAB 回顶按钮与 scroll-top 同步 */
function onDetailScroll(e: { detail: { scrollTop: number } }) {
  scrollTop.value = e.detail.scrollTop
  fabRef.value?.onPageScroll(e.detail.scrollTop)
  backTopRef.value?.onPageScroll(e.detail.scrollTop)
}

function handleGoTop() {
  scrollToTop.value = scrollTop.value
  nextTick(() => {
    scrollToTop.value = 0
  })
}

/** 目录跳转：scroll-view 须改 scroll-top，不能用 window.scrollIntoView */
function handleTocScroll(target: number) {
  scrollToTop.value = scrollTop.value
  nextTick(() => {
    scrollToTop.value = target
  })
}

function onLikesUpdate(count: number) {
  if (article.value)
    article.value.likes = count
  void loadLikeState()
}

async function onTipped() {
  await loadArticle()
}

/** 发表评论；pending 时不刷新列表（尚未公开展示） */
async function submitComment() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  if (!commentText.value.trim())
    return
  const res = await addComment({ articleId: articleId.value, content: commentText.value.trim() })
  const status = parseCommentCreateStatus(res)
  commentText.value = ''
  if (status === 'pending') {
    toastSuccess('评论已提交，审核通过后将展示')
    return
  }
  toast('评论成功')
  await reloadComments()
}

function startReply(comment: any, reply?: any) {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  const target = reply ?? comment
  const replyUid = resolveCommentUserUid(target)
  if (!replyUid) {
    toast('无法获取回复对象')
    return
  }
  replyTarget.value = {
    commentId: comment.id,
    replyUid,
    nickname: target.userInfo?.nickname ?? comment.userInfo?.nickname ?? comment.nickname ?? comment.username ?? '用户',
  }
  replyText.value = ''
  showReplyPopup.value = true
}

function closeReply() {
  showReplyPopup.value = false
  replyTarget.value = null
  replyText.value = ''
}

/** 发表楼中楼回复；pending 时不刷新列表 */
async function submitReply() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  if (!replyTarget.value) {
    return
  }
  if (!replyText.value.trim()) {
    toast('请输入回复内容')
    return
  }
  if (replySubmitting.value)
    return
  replySubmitting.value = true
  try {
    const res = await addReply({
      parentId: String(replyTarget.value.commentId),
      content: replyText.value.trim(),
      replyUid: String(replyTarget.value.replyUid),
    })
    const status = parseCommentCreateStatus(res)
    closeReply()
    if (status === 'pending') {
      toastSuccess('回复已提交，审核通过后将展示')
      return
    }
    toast('回复成功')
    await reloadComments()
  }
  catch {
    // http 层已 toast 业务错误
  }
  finally {
    replySubmitting.value = false
  }
}

/** 删除本人评论 DELETE /comment/delete */
async function handleDeleteComment(id: number | string) {
  await delComment(id)
  toastSuccess('删除成功')
  if (replyTarget.value && String(replyTarget.value.commentId) === String(id))
    closeReply()
  await reloadComments()
}

/** 删除本人回复 DELETE /reply/delete */
async function handleDeleteReply(id: number | string) {
  await delReply(id)
  toastSuccess('删除成功')
  await reloadComments()
}

function resolveItemOwnerUid(item: { uid?: number | string, userInfo?: { id?: number | string } }) {
  const raw = item.userInfo?.id ?? item.uid
  const uid = Number(raw)
  return Number.isFinite(uid) ? uid : 0
}

function canDeleteItem(item: { uid?: number | string, userInfo?: { id?: number | string } }) {
  const ownerUid = resolveItemOwnerUid(item)
  return currentUserId.value > 0 && ownerUid === currentUserId.value
}

/** MdPreview 目录回调 */
function onCatalog(items: ArticleTocItem[]) {
  tocTopics.value = items
}

/** 小程序 mp-html 渲染完成后重新测量目录偏移 */
function onMarkdownRendered() {
  articleTocRef.value?.remeasure?.()
}

/** 预览封面大图 */
function previewCover() {
  if (!coverUrl.value)
    return
  uni.previewImage({ urls: [coverUrl.value] })
}

function goArticle(id: number | string) {
  uni.redirectTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function goAuthorProfile() {
  if (!authorUid.value)
    return
  uni.navigateTo({ url: `${ROUTE_USER_PUBLIC}?uid=${authorUid.value}` })
}

function commentAvatar(item: { userInfo?: { avatar?: string }, avatar?: string }) {
  const url = item.userInfo?.avatar || item.avatar || DEFAULT_AVATAR
  return resolveStaticUrl(String(url))
}
</script>

<template>
  <view v-if="loading" class="p-4 text-center text-tech-subtle">
    加载中...
  </view>
  <view v-else-if="!article" class="p-4 text-center text-tech-subtle">
    文章不存在
  </view>
  <view v-else class="detail-root">
    <scroll-view
      id="detail-scroll"
      scroll-y
      class="detail-page cyber-page-grid u-page-scroll"
      :scroll-top="scrollToTop"
      @scroll="onDetailScroll"
    >
      <view class="u-page-body py-3">
        <ArticleDetailHero
          v-if="article"
          :article="article"
          :author-uid="authorUid"
          :liked="liked"
          @like="handleHeroLike"
          @tipped="onTipped"
        />

        <view class="detail-content-card cyber-glass-card p-3">
          <view class="detail-meta-bar u-gap-3 flex items-center justify-between">
            <view
              v-if="showAuthor"
              class="detail-author u-gap-2 min-w-0 flex flex-1 items-center"
              @tap="goAuthorProfile"
            >
              <AvatarWithFrame
                :avatar="authorAvatarSrc"
                :alt="authorNickname || '作者'"
                :frame="authorAvatarFrame"
                :size="40"
              />
              <view class="min-w-0">
                <view class="u-gap-1 flex flex-wrap items-center">
                  <text class="detail-author-name text-sm text-tech font-semibold">{{ authorNickname || '作者' }}</text>
                  <RpgLevelBadge
                    v-if="authorLevel"
                    :level="authorLevel"
                    variant="author"
                  />
                </view>
                <text v-if="authorUid" class="detail-author-hint block text-xs text-tech-subtle">主页</text>
              </view>
            </view>
            <view
              v-if="coverUrl"
              class="detail-cover-thumb shrink-0"
              @tap="previewCover"
            >
              <image :src="coverUrl" class="detail-cover-thumb-img" mode="aspectFill" />
            </view>
          </view>

          <view class="mt-4">
            <MarkdownView
              :content="String(article.content || '')"
              @catalog="onCatalog"
              @rendered="onMarkdownRendered"
            />
          </view>

          <ArticleRelatedList :list="relatedList" @navigate="goArticle" />
          <ArticleAdjacentNav
            :prev="adjacentPrev"
            :next="adjacentNext"
            @navigate="goArticle"
          />
          <ArticleShareBar :article-id="article.id" :title="article.title" />
        </view>

        <view class="mt-6">
          <text class="mb-2 block text-tech font-medium">评论 ({{ commentTotal }})</text>
          <view class="cyber-glass-card cyber-card-pad-sm mb-4">
            <wd-textarea v-model="commentText" placeholder="写下你的评论..." />
            <wd-button size="small" class="mt-2" @click="submitComment">
              发表评论
            </wd-button>
          </view>
          <view v-for="c in comments" :key="c.id" class="cyber-glass-card cyber-card-pad-sm mb-3">
            <view class="u-gap-2 flex items-start">
              <image :src="commentAvatar(c)" class="detail-comment-avatar shrink-0" mode="aspectFill" />
              <view class="min-w-0 flex-1">
                <view class="flex items-center justify-between">
                  <view class="u-gap-2 min-w-0 flex flex-1 items-center">
                    <text class="text-sm text-tech font-medium">{{ c.nickname || c.username || c.userInfo?.nickname }}</text>
                    <text v-if="c.createTime" class="text-xs text-tech-subtle">{{ formatRelativeTime(c.createTime) }}</text>
                  </view>
                  <view class="detail-comment-actions">
                    <view class="action-link action-link--primary" @tap="startReply(c)">
                      <text>回复</text>
                    </view>
                    <view
                      v-if="canDeleteItem(c)"
                      class="action-link action-link--danger"
                      @tap="handleDeleteComment(c.id)"
                    >
                      <text>删除</text>
                    </view>
                  </view>
                </view>
                <text class="mt-1 block text-sm text-tech-muted">{{ c.content }}</text>

                <view v-for="r in c.replys || []" :key="r.id" class="cyber-glass-card cyber-card-pad-xs mt-2">
                  <view class="u-gap-2 flex items-start">
                    <image :src="commentAvatar(r)" class="detail-reply-avatar shrink-0" mode="aspectFill" />
                    <view class="min-w-0 flex-1">
                      <view class="flex items-center justify-between">
                        <view class="u-gap-2 min-w-0 flex flex-1 items-center">
                          <text class="text-xs text-tech font-medium">
                            {{ r.userInfo?.nickname }}
                            <text v-if="r.tUserInfo?.nickname" class="text-tech-subtle"> @ {{ r.tUserInfo.nickname }}</text>
                          </text>
                          <text v-if="r.createTime" class="text-xs text-tech-subtle">{{ formatRelativeTime(r.createTime) }}</text>
                        </view>
                        <view class="detail-comment-actions">
                          <view class="action-link action-link--primary" @tap="startReply(c, r)">
                            <text>回复</text>
                          </view>
                          <view
                            v-if="canDeleteItem(r)"
                            class="action-link action-link--danger"
                            @tap="handleDeleteReply(r.id)"
                          >
                            <text>删除</text>
                          </view>
                        </view>
                      </view>
                      <text class="mt-1 block text-xs text-tech-muted">{{ r.content }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="commentHasMore" class="mt-3 text-center">
            <cyber-button
              size="small"
              variant="secondary"
              :disabled="commentsLoading"
              @click="loadMoreComments"
            >
              {{ commentsLoading ? '加载中...' : '加载更多评论' }}
            </cyber-button>
          </view>
        </view>
      </view>
    </scroll-view>

    <ArticleToc
      ref="articleTocRef"
      :topics="tocTopics"
      :scroll-top="scrollTop"
      @scroll-to="handleTocScroll"
    />

    <ArticleRpgFab
      v-if="article.id && authorUid"
      ref="fabRef"
      :article-id="article.id"
      :author-uid="authorUid"
      :likes="article.likes"
      @update:likes="onLikesUpdate"
      @tipped="onTipped"
    />

    <CyberBackTop ref="backTopRef" class="detail-back-top" @click="handleGoTop" />

    <!-- 回复弹层置于 scroll-view 外，避免小程序端输入/按钮无响应 -->
    <wd-popup v-model="showReplyPopup" position="bottom" closable @close="closeReply">
      <view class="reply-popup cyber-page p-4">
        <text class="mb-3 block text-tech font-medium">
          回复 @{{ replyTarget?.nickname || '用户' }}
        </text>
        <wd-textarea v-model="replyText" placeholder="写下回复..." :maxlength="300" />
        <cyber-button
          block
          class="mt-4"
          variant="primary"
          @click="submitReply"
        >
          {{ replySubmitting ? '发送中...' : '确认' }}
        </cyber-button>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.detail-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* #ifdef MP-WEIXIN || MP-ALIPAY */
.detail-root {
  height: 100%;
}
/* #endif */

.detail-page {
  flex: 1;
  height: 0;
}

.detail-content-card {
  margin-top: 8rpx;
}

.detail-meta-bar {
  min-height: 80rpx;
}

.detail-cover-thumb {
  width: 120rpx;
  height: 90rpx;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1px solid var(--tech-border);
  background: rgba(255, 255, 255, 0.04);
}

.detail-cover-thumb-img {
  width: 100%;
  height: 100%;
}

.detail-author:active {
  opacity: 0.85;
}

.detail-author-name,
.detail-author-hint {
  line-height: 1.25;
}

.article-meta-badge {
  display: inline-flex;
  align-items: center;
  height: 36rpx;
  padding: 0 12rpx;
  border: 1px solid;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 1;
  white-space: nowrap;
}

.detail-comment-actions {
  display: flex;
  align-items: center;
}

.action-link {
  padding: 8rpx 0 8rpx 16rpx;
}

.action-link text {
  font-size: 24rpx;
}

.action-link--primary text {
  color: var(--tech-primary);
}

.action-link--danger text {
  color: #f87171;
}

.detail-comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 1px solid var(--tech-border);
}

.detail-reply-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 1px solid var(--tech-border);
}

.detail-back-top {
  bottom: 200rpx;
}

/* #ifdef H5 */
.detail-back-top {
  bottom: calc(200rpx + env(safe-area-inset-bottom));
}
/* #endif */

/* #ifdef H5 */
.reply-popup {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
/* #endif */

/* #ifdef MP-WEIXIN || MP-ALIPAY */
.reply-popup {
  padding-bottom: 32rpx;
}
/* #endif */
</style>

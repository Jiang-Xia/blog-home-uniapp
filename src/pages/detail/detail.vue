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
  checkCollected,
  checkLiked,
  delComment,
  delReply,
  getArticleInfo,
  getComment,
  getRelatedArticles,
  parseArticleDetail,
  postArticleViews,
  toggleCollect,
  toggleLike,
} from '@/api/article'
import ArticleAdjacentNav from '@/components/article-adjacent-nav/article-adjacent-nav.vue'
import ArticleRelatedList from '@/components/article-related-list/article-related-list.vue'
import ArticleToc from '@/components/article-toc/article-toc.vue'
import MarkdownView from '@/components/markdown-view/markdown-view.vue'
import RpgArticleTip from '@/components/rpg/rpg-article-tip.vue'
import { ROUTE_CATEGORY_LIST, ROUTE_DETAIL, ROUTE_TAG_LIST } from '@/router/routes'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import type { ArticleTocItem } from '@/utils/article-toc'
import { parseCommentCreateStatus, resolveCommentUserUid } from '@/utils/comment'
import { apiDisplayLabel } from '@/utils/display-label'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: { navigationBarTitleText: '文章详情' },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const articleId = ref('')
const article = ref<Record<string, any> | null>(null)
const adjacentPrev = ref<{ id: number, title: string } | null>(null)
const adjacentNext = ref<{ id: number, title: string } | null>(null)
const relatedList = ref<ArticleItem[]>([])
const comments = ref<any[]>([])
const liked = ref(false)
const collected = ref(false)
const commentText = ref('')
/** 当前展开回复框的评论 id（楼中楼 parentId 仍为该评论 id） */
const activeReplyCommentId = ref<string | number | null>(null)
const replyTarget = ref<{ commentId: string | number, replyUid: number, nickname: string } | null>(null)
const replyText = ref('')
const loading = ref(true)
const tocTopics = ref<ArticleTocItem[]>([])

const currentUserId = computed(() => userStore.userInfo.userId)
const coverUrl = computed(() => resolveStaticUrl(String(article.value?.cover ?? '')))
const authorUid = computed(() => Number(article.value?.uid ?? article.value?.userInfo?.id ?? 0))

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
      const commentRes = await getComment(articleId.value, { page: 1, pageSize: 50 })
      comments.value = commentRes?.list ?? []
      const related = await getRelatedArticles(articleId.value)
      relatedList.value = related?.list ?? []
      if (tokenStore.hasLogin) {
        liked.value = (await checkLiked(articleId.value))?.liked ?? false
        collected.value = (await checkCollected(articleId.value))?.collected ?? false
      }
    }
  }
  finally {
    loading.value = false
  }
}

/** 仅刷新评论列表（删除/已通过评论后） */
async function reloadComments() {
  const commentRes = await getComment(articleId.value, { page: 1, pageSize: 50 })
  comments.value = commentRes?.list ?? []
}

onLoad((query) => {
  articleId.value = String(query?.id ?? '')
  void loadArticle()
})

async function handleLike() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  await toggleLike(articleId.value)
  liked.value = !liked.value
}

async function handleCollect() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  await toggleCollect(articleId.value)
  collected.value = !collected.value
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
    uni.showToast({ title: '评论已提交，审核通过后将展示', icon: 'none' })
    return
  }
  uni.showToast({ title: '评论成功', icon: 'success' })
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
    uni.showToast({ title: '无法获取回复对象', icon: 'none' })
    return
  }
  activeReplyCommentId.value = comment.id
  replyTarget.value = {
    commentId: comment.id,
    replyUid,
    nickname: target.userInfo?.nickname ?? comment.userInfo?.nickname ?? comment.nickname ?? comment.username ?? '用户',
  }
  replyText.value = ''
}

function cancelReply() {
  activeReplyCommentId.value = null
  replyTarget.value = null
  replyText.value = ''
}

/** 发表楼中楼回复；pending 时不刷新列表 */
async function submitReply() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  if (!replyTarget.value || !replyText.value.trim())
    return
  try {
    const res = await addReply({
      parentId: replyTarget.value.commentId,
      content: replyText.value.trim(),
      replyUid: replyTarget.value.replyUid,
    })
    const status = parseCommentCreateStatus(res)
    cancelReply()
    if (status === 'pending') {
      uni.showToast({ title: '回复已提交，审核通过后将展示', icon: 'none' })
      return
    }
    uni.showToast({ title: '回复成功', icon: 'success' })
    await reloadComments()
  }
  catch {
    // http 层已 toast 业务错误
  }
}

/** 删除本人评论 DELETE /comment/delete */
async function handleDeleteComment(id: number | string) {
  await delComment(id)
  uni.showToast({ title: '删除成功', icon: 'success' })
  if (activeReplyCommentId.value === id)
    cancelReply()
  await reloadComments()
}

/** 删除本人回复 DELETE /reply/delete */
async function handleDeleteReply(id: number | string) {
  await delReply(id)
  uni.showToast({ title: '删除成功', icon: 'success' })
  await reloadComments()
}

function canDeleteItem(item: { uid?: number }) {
  return currentUserId.value > 0 && Number(item.uid) === currentUserId.value
}

/** MdPreview 目录回调 */
function onCatalog(items: ArticleTocItem[]) {
  tocTopics.value = items
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

function goTag(id: number) {
  uni.navigateTo({ url: `${ROUTE_TAG_LIST}?id=${id}` })
}

function goCategory(id: number) {
  uni.navigateTo({ url: `${ROUTE_CATEGORY_LIST}?id=${id}` })
}
</script>

<template>
  <view v-if="loading" class="p-4 text-center text-tech-subtle">
    加载中...
  </view>
  <view v-else-if="!article" class="p-4 text-center text-tech-subtle">
    文章不存在
  </view>
  <scroll-view v-else scroll-y class="detail-page cyber-page-grid">
    <view class="px-4 py-3">
      <text class="block text-xl text-tech font-bold leading-snug">{{ article.title }}</text>
      <text class="mt-2 block text-xs text-tech-subtle">{{ article.createTime || article.uTime }}</text>
      <image
        v-if="coverUrl"
        :src="coverUrl"
        mode="widthFix"
        class="mt-3 w-full border border-tech rounded-lg"
        @click="previewCover"
      />
      <ArticleToc :topics="tocTopics" />
      <view v-if="article.category || article.tags?.length" class="mt-3 flex flex-wrap gap-2">
        <text
          v-if="article.category?.id"
          class="cyber-feature-tag"
          @click="goCategory(article.category.id)"
        >
          {{ apiDisplayLabel(article.category) }}
        </text>
        <text
          v-for="tag in article.tags"
          :key="tag.id"
          class="cyber-feature-tag"
          @click="goTag(tag.id)"
        >
          {{ apiDisplayLabel(tag) }}
        </text>
      </view>
      <view class="mt-4">
        <MarkdownView :content="String(article.content || '')" @catalog="onCatalog" />
      </view>

      <ArticleRelatedList :list="relatedList" @navigate="goArticle" />
      <ArticleAdjacentNav
        :prev="adjacentPrev"
        :next="adjacentNext"
        @navigate="goArticle"
      />

      <RpgArticleTip
        v-if="article.id && authorUid"
        :article-id="Number(article.id)"
        :author-uid="authorUid"
      />
      <view class="mt-4 flex gap-4">
        <wd-button size="small" :type="liked ? 'primary' : undefined" @click="handleLike">
          {{ liked ? '已赞' : '点赞' }}
        </wd-button>
        <wd-button size="small" :type="collected ? 'primary' : undefined" @click="handleCollect">
          {{ collected ? '已收藏' : '收藏' }}
        </wd-button>
      </view>

      <view class="mt-6">
        <text class="mb-2 block text-tech font-medium">评论</text>
        <wd-textarea v-model="commentText" placeholder="写下你的评论..." />
        <wd-button size="small" class="mt-2" @click="submitComment">
          发表评论
        </wd-button>
        <view v-for="c in comments" :key="c.id" class="mt-3 border-t border-tech pt-2">
          <view class="flex items-center justify-between">
            <text class="text-sm text-tech font-medium">{{ c.nickname || c.username || c.userInfo?.nickname }}</text>
            <view class="flex gap-2">
              <text
                v-if="activeReplyCommentId !== c.id"
                class="text-xs text-tech-primary"
                @click="startReply(c)"
              >
                回复
              </text>
              <text
                v-else
                class="text-xs text-tech-subtle"
                @click="cancelReply"
              >
                取消
              </text>
              <text
                v-if="canDeleteItem(c)"
                class="text-xs text-red-400"
                @click="handleDeleteComment(c.id)"
              >
                删除
              </text>
            </view>
          </view>
          <text class="mt-1 block text-sm text-tech-muted">{{ c.content }}</text>

          <!-- 内联回复框：紧跟当前评论，对齐 nuxt XiaReply -->
          <view v-if="activeReplyCommentId === c.id && replyTarget" class="cyber-glass-card mt-2 p-3">
            <text class="mb-2 block text-xs text-tech-subtle">回复 @{{ replyTarget.nickname }}</text>
            <wd-textarea v-model="replyText" placeholder="写下回复..." />
            <view class="mt-2 flex gap-2">
              <cyber-button size="small" variant="primary" @click="submitReply">
                发送
              </cyber-button>
              <cyber-button size="small" variant="secondary" @click="cancelReply">
                取消
              </cyber-button>
            </view>
          </view>

          <view v-for="r in c.replys || []" :key="r.id" class="ml-4 mt-2 border-l-2 border-tech pl-3">
            <view class="flex items-center justify-between">
              <text class="text-xs text-tech font-medium">
                {{ r.userInfo?.nickname }}
                <text v-if="r.tUserInfo?.nickname" class="text-tech-subtle"> @ {{ r.tUserInfo.nickname }}</text>
              </text>
              <view class="flex gap-2">
                <text
                  v-if="activeReplyCommentId !== c.id"
                  class="text-xs text-tech-primary"
                  @click="startReply(c, r)"
                >
                  回复
                </text>
                <text
                  v-if="canDeleteItem(r)"
                  class="text-xs text-red-400"
                  @click="handleDeleteReply(r.id)"
                >
                  删除
                </text>
              </view>
            </view>
            <text class="mt-1 block text-xs text-tech-muted">{{ r.content }}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.detail-page {
  height: 100vh;
}
</style>

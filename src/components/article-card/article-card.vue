<script setup lang="ts">
/**
 * 文章卡片（对齐 blog-home-nuxt components/article-list.vue 列表项）
 * - 置顶 / 文章等级 / 神作徽章
 * - 作者头像、昵称、作者 RPG 等级
 */
import type { ArticleItem } from '@/api/article'
import RpgLevelBadge from '@/components/rpg/rpg-level-badge.vue'
import { useAuthorRpgLevels } from '@/composables/use-author-rpg-levels'
import { ROUTE_DETAIL, ROUTE_USER_PUBLIC } from '@/router/routes'
import { formatDate } from '@/utils/date-time'
import { apiDisplayLabel } from '@/utils/display-label'
import { resolveStaticUrl } from '@/utils/static-url'

const props = withDefaults(defineProps<{
  item: ArticleItem
  /** compact：左封面右文案，用于搜索页等紧凑列表 */
  layout?: 'default' | 'compact'
}>(), {
  layout: 'default',
})

const { getAuthorLevel } = useAuthorRpgLevels()

const DEFAULT_AVATAR = '/static/images/default-avatar.png'

const coverUrl = computed(() => resolveStaticUrl(String(props.item.cover ?? '')))

const authorUid = computed(() => {
  const uid = props.item.uid ?? props.item.userInfo?.id
  return uid ? Number(uid) : 0
})

const authorName = computed(() =>
  props.item.userInfo?.nickname || props.item.userInfo?.username || '匿名用户',
)

const authorAvatar = computed(() =>
  resolveStaticUrl(props.item.userInfo?.avatar || DEFAULT_AVATAR),
)

const isTopping = computed(() => !!props.item.topping)

const showArticleLevel = computed(() => (props.item.articleLevel ?? 0) > 1)

const isMasterpiece = computed(() => !!props.item.isMasterpiece)

const authorLevel = computed(() => getAuthorLevel(authorUid.value))

function tagLabel(tag: { name?: string, label?: string }) {
  return apiDisplayLabel(tag)
}

function categoryLabel(cat?: { name?: string, label?: string }) {
  return apiDisplayLabel(cat)
}

function metaBadgeStyle(color = '#22d3ee') {
  return {
    borderColor: color,
    color,
    backgroundColor: `${color}22`,
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function goUserPublic(uid: number) {
  if (!uid)
    return
  uni.navigateTo({ url: `${ROUTE_USER_PUBLIC}?uid=${uid}` })
}
</script>

<template>
  <view
    class="article-card cyber-glass-card cyber-glass-card-flush mb-3 overflow-hidden"
    :class="layout === 'compact' ? 'article-card--compact' : ''"
    @click="goDetail(item.id)"
  >
    <view v-if="layout === 'compact'" class="article-card-compact-row u-gap-3">
      <view v-if="coverUrl" class="article-card-compact-cover article-cover-wrap shrink-0">
        <image :src="coverUrl" mode="aspectFill" class="article-card-compact-cover-img article-cover-wrap__img" />
      </view>
      <view v-else class="article-card-compact-cover article-card-compact-cover--placeholder article-cover-wrap shrink-0">
        <text class="article-card-compact-cover-placeholder">📄</text>
      </view>
      <view class="article-card-body article-card-body--compact min-w-0 flex-1">
        <view class="article-card-title-row">
          <text class="article-card-title text-base text-tech font-semibold">{{ item.title }}</text>
          <text v-if="isTopping" class="article-top-badge">TOP</text>
          <view v-if="showArticleLevel" class="article-card-title-badge">
            <RpgLevelBadge
              :level="item.articleLevel!"
              variant="article"
            />
          </view>
        </view>
        <view v-if="item.category || item.tags?.length" class="article-card-chips u-gap-1 mt-2 flex flex-wrap">
          <text
            v-if="item.category?.id"
            class="article-meta-badge"
            :style="metaBadgeStyle(item.category.color || '#4ade80')"
          >
            {{ categoryLabel(item.category) }}
          </text>
          <text
            v-for="tag in (item.tags || []).slice(0, 2)"
            :key="tag.id"
            class="article-meta-badge"
            :style="metaBadgeStyle(tag.color || '#60a5fa')"
          >
            {{ tagLabel(tag) }}
          </text>
        </view>
        <view class="article-card-stats mt-2 flex flex-wrap items-center text-xs text-tech-subtle">
          <view v-if="item.views != null" class="article-card-stat">
            <wd-icon name="eye" size="14px" color="var(--tech-fg-subtle)" />
            <text class="ml-1">{{ item.views }}</text>
          </view>
          <text v-if="item.createTime" class="ml-auto">{{ formatDate(item.createTime) }}</text>
        </view>
      </view>
    </view>

    <template v-else>
      <view v-if="coverUrl" class="article-card-cover p-2">
        <view class="article-cover-wrap">
          <image :src="coverUrl" mode="aspectFill" class="article-card-cover-img article-cover-wrap__img" />
        </view>
      </view>
      <view class="article-card-body px-3 pb-3">
        <view class="article-card-title-row">
          <text class="article-card-title text-base text-tech font-semibold">{{ item.title }}</text>
          <text v-if="isTopping" class="article-top-badge">TOP</text>
          <view v-if="showArticleLevel" class="article-card-title-badge">
            <RpgLevelBadge
              :level="item.articleLevel!"
              variant="article"
            />
          </view>
          <view v-if="isMasterpiece" class="article-card-title-badge">
            <RpgLevelBadge
              :level="0"
              variant="masterpiece"
            />
          </view>
        </view>

        <text v-if="item.description" class="line-clamp-2 mt-2 block text-sm text-tech-muted leading-relaxed">
          {{ item.description }}
        </text>

        <view v-if="item.category || item.tags?.length" class="article-card-chips u-gap-1 mt-3 flex flex-wrap">
          <text
            v-if="item.category?.id"
            class="article-meta-badge"
            :style="metaBadgeStyle(item.category.color || '#4ade80')"
          >
            {{ categoryLabel(item.category) }}
          </text>
          <text
            v-for="tag in (item.tags || []).slice(0, 3)"
            :key="tag.id"
            class="article-meta-badge"
            :style="metaBadgeStyle(tag.color || '#60a5fa')"
          >
            {{ tagLabel(tag) }}
          </text>
          <text
            v-if="(item.tags?.length || 0) > 3"
            class="article-meta-badge article-meta-badge--more"
          >
            +{{ (item.tags?.length || 0) - 3 }}
          </text>
        </view>

        <view class="article-card-stats mt-3 flex flex-wrap items-center text-xs text-tech-subtle">
          <view class="article-card-stat">
            <wd-icon name="eye" size="14px" color="var(--tech-fg-subtle)" />
            <text class="ml-1">{{ item.views ?? 0 }}</text>
          </view>
          <view class="article-card-stat ml-3">
            <wd-icon name="thumb-up" size="14px" color="var(--tech-fg-subtle)" />
            <text class="ml-1">{{ item.likes ?? 0 }}</text>
          </view>
          <view class="article-card-stat ml-3">
            <wd-icon name="message" size="14px" color="var(--tech-fg-subtle)" />
            <text class="ml-1">{{ item.commentCount ?? 0 }}</text>
          </view>
        </view>

        <view class="article-card-footer mt-3 flex items-center justify-between">
          <view class="article-card-author u-gap-2 min-w-0 flex flex-1 items-center" @click.stop="goUserPublic(authorUid)">
            <view class="article-card-author-avatar shrink-0">
              <image
                :src="authorAvatar"
                class="article-card-author-avatar-img"
                mode="aspectFill"
              />
            </view>
            <text class="article-card-author-name text-sm text-tech">{{ authorName }}</text>
            <RpgLevelBadge
              v-if="authorLevel"
              :level="authorLevel"
              variant="author"
            />
            <text v-if="item.createTime" class="article-card-date text-xs text-tech-subtle">
              {{ formatDate(item.createTime) }}
            </text>
          </view>
          <text class="article-read-btn shrink-0 text-xs">阅读</text>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.article-card {
  transition: border-color 0.2s;
}

.article-card:active {
  border-color: rgba(103, 232, 249, 0.35);
}

.article-card-title-row {
  width: 100%;
  line-height: 1.45;
}

.article-card-title {
  display: inline;
}

.article-card-title-badge {
  display: inline-flex;
  vertical-align: middle;
  margin-left: 8rpx;
}

.article-top-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  vertical-align: middle;
  margin-left: 8rpx;
  padding: 2rpx 12rpx;
  border: 1px solid rgba(251, 191, 36, 0.45);
  border-radius: 8rpx;
  background: rgba(251, 191, 36, 0.12);
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1.2;
  color: #fbbf24;
}

.article-card-cover-img {
  display: block;
  height: 288rpx;
}

.article-card-stat {
  display: inline-flex;
  align-items: center;
  margin-right: 32rpx;
  margin-bottom: 8rpx;
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

.article-meta-badge--more {
  border-color: var(--tech-border);
  color: var(--tech-fg-muted);
  background: transparent;
}

.article-card-footer {
  gap: 16rpx;
}

.article-card-author {
  overflow: hidden;
}

.article-card-author-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.article-card-author-avatar-img {
  width: 100%;
  height: 100%;
}

.article-card-author-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200rpx;
}

.article-card-date {
  flex-shrink: 0;
  white-space: nowrap;
}

.article-read-btn {
  padding: 8rpx 20rpx;
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 999rpx;
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.08);
}

.article-card--compact {
  padding: 20rpx;
}

.article-card-compact-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 126rpx;
}

.article-card-compact-cover {
  width: 168rpx;
  height: 126rpx;
  background: rgba(255, 255, 255, 0.04);
}

.article-card-compact-cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-card-compact-cover-placeholder {
  font-size: 40rpx;
  line-height: 1;
}

.article-card-compact-cover-img {
  display: block;
  width: 100%;
  height: 100%;
}

.article-card-body--compact {
  padding: 0;
}
</style>

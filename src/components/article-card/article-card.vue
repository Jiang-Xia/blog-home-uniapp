<script setup lang="ts">
import type { ArticleItem } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'
import { formatDate } from '@/utils/date-time'
import { apiDisplayLabel } from '@/utils/display-label'
import { resolveStaticUrl } from '@/utils/static-url'

const props = withDefaults(defineProps<{
  item: ArticleItem & {
    commentCount?: number
    userInfo?: { nickname?: string, avatar?: string }
    category?: { id: number, name?: string, label?: string, color?: string }
    tags?: { id: number, name?: string, label?: string, color?: string }[]
  }
  /** compact：左封面右文案，用于搜索页等紧凑列表 */
  layout?: 'default' | 'compact'
}>(), {
  layout: 'default',
})

const coverUrl = computed(() => resolveStaticUrl(String(props.item.cover ?? '')))

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
        <text class="article-card-title block text-base text-tech font-semibold leading-snug">{{ item.title }}</text>
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
          <text
            v-if="(item.tags?.length || 0) > 2"
            class="article-meta-badge article-meta-badge--more"
          >
            +{{ (item.tags?.length || 0) - 2 }}
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
        <text class="article-card-title block text-base text-tech font-semibold leading-snug">{{ item.title }}</text>
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
          <text v-if="item.createTime" class="ml-auto">{{ formatDate(item.createTime) }}</text>
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

.article-card-stats > text.ml-auto {
  margin-right: 0;
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

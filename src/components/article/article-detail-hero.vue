<script lang="ts" setup>
/**
 * 文章详情 Hero 区（对齐 blog-home-nuxt ArticleDetailHero）
 * - 模糊封面背景、标题、RPG 徽章、阅读/点赞/打赏统计、分类标签、冒险引导条
 */
import RpgLevelBadge from '@/components/rpg/rpg-level-badge.vue'
import ArticleHeroSocialBar from '@/components/article/article-hero-social-bar.vue'
import { ROUTE_RPG_ENTRY } from '@/router/routes'
import { formatDate } from '@/utils/date-time'
import { apiDisplayLabel } from '@/utils/display-label'
import { resolveStaticUrl } from '@/utils/static-url'

const props = defineProps<{
  article: Record<string, any>
  authorUid?: number
  liked?: boolean
}>()

const emit = defineEmits<{
  like: []
  tipped: []
}>()

const coverSrc = computed(() => resolveStaticUrl(String(props.article.cover ?? '')))

const showArticleLevel = computed(() => (props.article.articleLevel ?? 0) > 1)

const hasRpgHighlights = computed(() =>
  showArticleLevel.value || !!props.article.isMasterpiece || !!props.article.tipTotal,
)

const tagItems = computed(() => props.article.tags ?? [])

function metaBadgeStyle(color?: string) {
  if (!color) {
    return {
      borderColor: 'rgba(255, 255, 255, 0.15)',
      color: 'rgba(255, 255, 255, 0.55)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    }
  }
  return {
    borderColor: color,
    color,
    backgroundColor: `${color}22`,
  }
}

function goRpg() {
  uni.switchTab({ url: ROUTE_RPG_ENTRY })
}
</script>

<template>
  <view class="article-detail-hero">
    <view v-if="coverSrc" class="hero-bg" aria-hidden="true">
      <image :src="coverSrc" class="hero-bg-img" mode="aspectFill" />
    </view>
    <view class="hero-overlay" aria-hidden="true" />
    <view class="hero-glow" aria-hidden="true" />
    <text class="hero-watermark" aria-hidden="true">⚔️</text>

    <view class="hero-inner">
      <view class="hero-eyebrow">
        <text class="hero-eyebrow-icon">⚔️</text>
        <text>QUEST · 冒险篇章</text>
      </view>

      <text class="hero-title">{{ article.title }}</text>

      <view v-if="hasRpgHighlights" class="hero-badges">
        <view v-if="article.isMasterpiece" class="hero-badge-item">
          <RpgLevelBadge :level="0" variant="masterpiece" size="sm" />
        </view>
        <view v-if="showArticleLevel" class="hero-badge-item">
          <RpgLevelBadge :level="article.articleLevel" variant="article" size="sm" />
        </view>
        <text v-if="article.tipTotal" class="hero-tip-badge">💎 {{ article.tipTotal }} 打赏</text>
      </view>

      <view class="hero-stats">
        <view class="hero-stat">
          <wd-icon name="eye" size="16px" color="rgba(255,255,255,0.55)" />
          <view class="hero-stat-text">
            <text class="hero-stat-value">{{ article.views ?? 0 }}</text>
            <text class="hero-stat-label">阅读</text>
          </view>
        </view>
        <view class="hero-stat hero-stat--action" @tap="emit('like')">
          <cyber-icon v-if="liked" name="heart" size="32rpx" />
          <wd-icon v-else name="heart" size="16px" color="rgba(255,255,255,0.55)" />
          <view class="hero-stat-text">
            <text class="hero-stat-value">{{ article.likes ?? 0 }}</text>
            <text class="hero-stat-label">点赞</text>
          </view>
        </view>
        <view v-if="article.tipTotal" class="hero-stat hero-stat--tip">
          <text class="hero-stat-emoji">💎</text>
          <view class="hero-stat-text">
            <text class="hero-stat-value">{{ article.tipTotal }}</text>
            <text class="hero-stat-label">打赏</text>
          </view>
        </view>
      </view>

      <view class="hero-meta">
        <text
          v-if="article.category?.id"
          class="hero-meta-badge"
          :style="metaBadgeStyle(article.category.color)"
        >
          {{ apiDisplayLabel(article.category) }}
        </text>
        <text
          v-for="tag in tagItems"
          :key="tag.id"
          class="hero-meta-badge"
          :style="metaBadgeStyle(tag.color)"
        >
          {{ apiDisplayLabel(tag) }}
        </text>
        <text v-if="article.uTime || article.createTime" class="hero-meta-badge hero-meta-badge--neutral">
          更新于 {{ formatDate(article.uTime || article.createTime) }}
        </text>
      </view>

      <view v-if="authorUid" class="hero-rpg-strip">
        <view class="hero-rpg-strip-main">
          <text class="hero-rpg-strip-badge">RPG</text>
          <text class="hero-rpg-strip-text">阅读此文可推进冒险任务 · 点赞、收藏、打赏均可获得经验</text>
        </view>
        <text class="hero-rpg-link" @tap="goRpg">进入冒险大厅 →</text>
      </view>

      <ArticleHeroSocialBar
        v-if="authorUid"
        :author-uid="authorUid"
        :article-id="article.id"
        @tipped="emit('tipped')"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
.article-detail-hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin: -24rpx -24rpx 24rpx;
}

.hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.hero-bg-img {
  width: 100%;
  height: 100%;
  transform: scale(1.04);
  opacity: 0.72;
}

/* #ifdef H5 */
.hero-bg-img {
  filter: blur(10px) saturate(1.1);
}
/* #endif */

.hero-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(180deg, rgba(5, 5, 5, 0.35) 0%, rgba(5, 5, 5, 0.72) 45%, rgba(5, 5, 5, 0.92) 100%);
}

.hero-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 55% 45% at 88% 12%, rgba(245, 158, 11, 0.18), transparent 60%),
    radial-gradient(ellipse 45% 40% at 8% 88%, rgba(139, 92, 246, 0.14), transparent 55%);
}

.hero-watermark {
  position: absolute;
  right: -8rpx;
  top: -16rpx;
  font-size: 160rpx;
  line-height: 1;
  opacity: 0.06;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  padding: 56rpx 24rpx 40rpx;
  text-align: center;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 8rpx 24rpx;
  border: 1px solid var(--tech-rpg-amber-border);
  border-radius: 9999px;
  background: rgba(251, 191, 36, 0.08);
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--tech-rpg-amber);
}

.hero-eyebrow-icon {
  margin-right: 8rpx;
  font-size: 24rpx;
}

.hero-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.3;
  color: var(--tech-fg);
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.hero-badge-item {
  margin-right: 12rpx;
  margin-bottom: 8rpx;
}

.hero-tip-badge {
  display: inline-flex;
  align-items: center;
  margin-right: 12rpx;
  margin-bottom: 8rpx;
  padding: 4rpx 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8rpx;
  background: rgba(167, 139, 250, 0.12);
  font-size: 24rpx;
  font-weight: 600;
  color: #c4b5fd;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  margin-bottom: 20rpx;
}

.hero-stat {
  display: inline-flex;
  align-items: center;
  min-width: 160rpx;
  margin: 0 8rpx 12rpx;
  padding: 12rpx 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.05);
}

.hero-stat--action:active {
  border-color: var(--tech-rpg-amber-border);
  background: rgba(251, 191, 36, 0.08);
}

.hero-stat--tip {
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.1);
}

.hero-stat-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 12rpx;
}

.hero-stat-value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--tech-fg);
  line-height: 1.25;
}

.hero-stat-label {
  font-size: 22rpx;
  color: var(--tech-fg-subtle);
  line-height: 1.25;
}

.hero-stat-emoji {
  font-size: 28rpx;
  line-height: 1;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.hero-meta-badge {
  display: inline-flex;
  align-items: center;
  height: 36rpx;
  margin: 0 6rpx 8rpx;
  padding: 0 12rpx;
  border: 1px solid;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 1;
  white-space: nowrap;
}

.hero-meta-badge--neutral {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.hero-rpg-strip {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 8rpx;
  padding: 20rpx 24rpx;
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 20rpx;
  background: rgba(251, 191, 36, 0.06);
  text-align: left;
}

.hero-rpg-strip-main {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.hero-rpg-strip-badge {
  flex-shrink: 0;
  margin-right: 16rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  font-size: 20rpx;
  font-weight: 800;
  color: #fff;
}

.hero-rpg-strip-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.45;
  color: var(--tech-fg-muted);
}

.hero-rpg-link {
  align-self: flex-end;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--tech-rpg-amber);
}
</style>

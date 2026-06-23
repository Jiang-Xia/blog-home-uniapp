<script lang="ts" setup>
import { getArticleList } from '@/api/article'
import type { ArticleItem } from '@/api/article'
import ArticleCard from '@/components/article-card/article-card.vue'
import { gushici, TOOL_COUNT } from '@/config/site-constant'
import { ROUTE_RPG_ENTRY, ROUTE_RPG_GUIDE, ROUTE_SEARCH } from '@/router/routes'

definePage({
  type: 'home',
  style: { navigationBarTitleText: '首页' },
})

const articleList = ref<ArticleItem[]>([])
const articleTotal = ref(0)
const pagingRef = ref<{ complete: (list: ArticleItem[]) => void, completeByTotal?: (list: ArticleItem[], total: number) => void, scrollToY?: (y: number) => void } | null>(null)

const poetryContent = ref('每日诗词')
const poetryAuthor = ref('')

const articleTotalLabel = computed(() =>
  articleTotal.value > 0 ? `${articleTotal.value}+` : '100+',
)

const heroStats = computed(() => [
  { value: articleTotalLabel.value, label: '技术文章', gradient: false },
  { value: `${TOOL_COUNT}+`, label: '实用工具', gradient: false },
  { value: '8 大', label: 'RPG 冒险玩法', gradient: true },
])

async function loadPoetry() {
  try {
    const data = await gushici()
    poetryContent.value = data.content?.trim() || '每日诗词'
    const { author, origin } = data
    poetryAuthor.value = author && origin ? `${author} — ${origin}` : (author || origin || '')
  }
  catch {
    poetryContent.value = '每日诗词'
    poetryAuthor.value = ''
  }
}

async function queryList(pageNo: number, pageSize: number) {
  try {
    const res = await getArticleList({
      page: pageNo,
      pageSize,
      client: true,
      sort: 'DESC',
      category: '',
      tags: [],
      title: '',
      description: '',
      content: '',
    })
    const list = res?.list ?? []
    const total = res?.pagination?.total ?? list.length
    if (pageNo === 1)
      articleTotal.value = total
    pagingRef.value?.completeByTotal?.(list, total) ?? pagingRef.value?.complete(list)
  }
  catch {
    pagingRef.value?.complete([])
  }
}

function goSearch() {
  uni.navigateTo({ url: ROUTE_SEARCH })
}

function goRpg() {
  uni.switchTab({ url: ROUTE_RPG_ENTRY })
}

function goRpgGuide() {
  uni.navigateTo({ url: ROUTE_RPG_GUIDE })
}

function scrollToArticles() {
  pagingRef.value?.scrollToY?.(420)
}

onMounted(() => {
  void loadPoetry()
})
</script>

<template>
  <z-paging
    ref="pagingRef"
    v-model="articleList"
    bg-color="#050505"
    :default-page-size="12"
    @query="queryList"
  >
    <view class="home-page cyber-page-grid">
      <!-- Hero 首屏 -->
      <view class="home-hero u-page-body pb-4 pt-3">
        <view class="home-hero-brand flex justify-center">
          <view class="home-hero-brand-chip">
            <view class="home-hero-brand-icon site-logo-badge">
              <text class="home-hero-brand-emoji">⚔️</text>
            </view>
            <view class="home-hero-status-dot" />
            <text class="home-hero-brand-label">Blog × RPG · 签到 · 任务 · 抽奖 · 排行榜</text>
          </view>
        </view>

        <view class="home-hero-stage py-3">
          <view class="home-hero-focus relative text-center">
            <view class="home-hero-poetry relative z-1 w-full">
              <text class="home-hero-poetry-title block font-bold leading-relaxed">
                <text class="cyber-gradient-text">{{ poetryContent }}</text>
              </text>
              <text v-if="poetryAuthor" class="home-hero-poetry-author mx-auto mt-2 block max-w-xl text-tech-muted">
                {{ poetryAuthor }}
              </text>
            </view>
          </view>
        </view>

        <view class="home-hero-cta flex flex-col items-center text-center">
          <text class="home-hero-tagline max-w-2xl text-sm text-tech-muted leading-relaxed">
            技术博客，也是冒险世界
            <text class="mx-1.5 text-tech-subtle">·</text>
            读文章 · 做任务 · 冲排行榜
          </text>

          <view class="home-hero-buttons mt-4 flex flex-wrap items-center justify-center">
            <view>
              <cyber-button size="small" variant="primary" @click="goRpg">
                ⚔️ 开始冒险
              </cyber-button>
            </view>
            <view>
              <cyber-button size="small" variant="secondary" @click="scrollToArticles">
                📖 浏览文章
              </cyber-button>
            </view>
            <view>
              <cyber-button size="small" variant="secondary" @click="goRpgGuide">
                冒险攻略
              </cyber-button>
            </view>
          </view>

          <view class="home-hero-stats u-gap-8 mt-5 flex flex-wrap items-center justify-center">
            <view v-for="stat in heroStats" :key="stat.label" class="text-center">
              <text
                class="home-hero-stat-value block font-bold"
                :class="stat.gradient ? 'home-hero-gradient-text' : 'text-tech-primary'"
              >
                {{ stat.value }}
              </text>
              <text class="mt-1 block text-xs text-tech-subtle">{{ stat.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 文章列表 -->
      <view id="articles" class="u-page-body pb-6">
        <view class="mb-4 flex items-end justify-between">
          <cyber-section-header
            class="flex-1 text-left"
            align="left"
            label="ARTICLES"
            title="最新文章"
            subtitle="技术分享与生活记录，欢迎阅读与交流"
          />
          <text class="shrink-0 text-sm text-tech-primary" @click="goSearch">搜索</text>
        </view>
        <view class="cyber-glass-card overflow-visible p-2">
          <ArticleCard v-for="item in articleList" :key="item.id" :item="item" />
          <view v-if="!articleList.length" class="py-16 text-center text-tech-subtle">
            暂无文章
          </view>
        </view>
      </view>
    </view>
  </z-paging>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

/* #ifdef MP-WEIXIN || MP-ALIPAY */
.home-page {
  min-height: 100%;
}
/* #endif */

.home-hero-brand {
  margin-bottom: 28rpx;
}

.home-hero-brand-chip {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  max-width: 100%;
  border: 1px solid var(--tech-border);
  border-radius: 9999px;
  background: rgba(17, 24, 39, 0.55);
  padding: 10rpx 28rpx 10rpx 14rpx;
}

.home-hero-brand-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  width: 40rpx;
  border-radius: 8rpx;
}

.home-hero-brand-emoji {
  font-size: 22rpx;
  line-height: 1;
}

.home-hero-status-dot {
  flex-shrink: 0;
  width: 12rpx;
  height: 12rpx;
  margin-left: 16rpx;
  border-radius: 50%;
  background-color: var(--tech-success);
  animation: home-status-breathe 2.2s ease-in-out infinite;
}

.home-hero-brand-label {
  margin-left: 12rpx;
  font-size: 26rpx;
  line-height: 1.25;
  color: var(--tech-fg-muted);
}

.home-hero-poetry {
  background: radial-gradient(
    ellipse 70% 62% at 50% 42%,
    rgba(34, 211, 238, 0.11) 0%,
    rgba(147, 51, 234, 0.05) 38%,
    transparent 68%
  );
}

/* #ifdef H5 */
.home-hero-poetry {
  background: none;
}

.home-hero-poetry::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: -20%;
  right: -10%;
  bottom: -14%;
  left: -10%;
  pointer-events: none;
  background: radial-gradient(
    ellipse 70% 62% at 50% 42%,
    rgba(34, 211, 238, 0.11) 0%,
    rgba(147, 51, 234, 0.05) 38%,
    transparent 68%
  );
}
/* #endif */

.home-hero-poetry-title {
  font-size: 48rpx;
}

/* #ifdef H5 */
.home-hero-poetry-title {
  font-size: clamp(40rpx, 4.5vw + 24rpx, 56rpx);
}
/* #endif */

.home-hero-gradient-text {
  color: var(--tech-rpg-amber);
}

/* #ifdef H5 */
.home-hero-gradient-text {
  background: linear-gradient(to right, var(--tech-gradient-from), var(--tech-rpg-amber), var(--tech-gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
/* #endif */

.home-hero-poetry-author {
  font-size: 30rpx;
  min-height: 40rpx;
}

.home-hero-stat-value {
  font-size: 36rpx;
}
</style>

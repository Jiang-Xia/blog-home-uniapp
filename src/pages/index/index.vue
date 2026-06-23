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
      <view class="home-hero px-4 pb-4 pt-3">
        <view class="home-hero-brand flex justify-center">
          <view class="home-hero-brand-chip max-w-full inline-flex items-center gap-2">
            <view class="home-hero-brand-icon site-logo-badge flex shrink-0 items-center justify-center rounded-md">
              <text class="text-xs leading-none">⚔️</text>
            </view>
            <view class="min-w-0 flex items-center gap-2 pr-0.5 text-sm text-tech-muted leading-snug">
              <view class="home-hero-status-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tech-success)]" />
              <text>Blog × RPG · 签到 · 任务 · 抽奖 · 排行榜</text>
            </view>
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

          <view class="home-hero-buttons mt-4 flex flex-wrap items-center justify-center gap-3">
            <cyber-button variant="primary" @click="goRpg">
              ⚔️ 开始冒险
            </cyber-button>
            <cyber-button variant="secondary" @click="scrollToArticles">
              📖 浏览文章
            </cyber-button>
            <cyber-button variant="secondary" size="small" @click="goRpgGuide">
              冒险攻略
            </cyber-button>
          </view>

          <view class="home-hero-stats mt-5 flex flex-wrap items-center justify-center gap-8">
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
      <view id="articles" class="px-3 pb-6">
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

.home-hero-brand {
  margin-bottom: 28rpx;
}

.home-hero-brand-chip {
  border: 1px solid var(--tech-border);
  border-radius: 9999px;
  background: rgba(17, 24, 39, 0.55);
  padding: 10rpx 28rpx 10rpx 14rpx;
}

.home-hero-brand-icon {
  height: 40rpx;
  width: 40rpx;
}

.home-hero-status-dot {
  animation: home-status-breathe 2.2s ease-in-out infinite;
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

.home-hero-poetry-title {
  font-size: clamp(40rpx, 4.5vw + 24rpx, 56rpx);
}

.home-hero-poetry-author {
  font-size: 30rpx;
  min-height: 40rpx;
}

.home-hero-gradient-text {
  background: linear-gradient(to right, var(--tech-gradient-from), var(--tech-rpg-amber), var(--tech-gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-hero-stat-value {
  font-size: 36rpx;
}
</style>

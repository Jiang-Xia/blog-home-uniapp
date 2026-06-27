<script lang="ts" setup>
/**
 * 他人公开主页（对齐 blog-home-nuxt pages/user/[uid].vue）
 * 数据来源：GET /user/public/:uid 及 articles/collects/likes 分页列表
 */
import AvatarWithFrame from '@/components/user/avatar-with-frame.vue'
import ProfileSocialBar from '@/components/user/profile-social-bar.vue'
import { getPublicUser, getPublicUserArticles, getPublicUserCollects, getPublicUserLikes } from '@/api/profile'
import { ROUTE_DETAIL } from '@/router/routes'
import { useUserStore } from '@/store'
import { resolvePublicAvatarFrame } from '@/utils/avatar-frame'
import { formatDate } from '@/utils/date-time'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: {
    navigationBarTitleText: '用户主页',
    backgroundColor: '#050505',
    backgroundColorTop: '#050505',
    backgroundColorBottom: '#050505',
  },
})

type ProfileTab = 'article' | 'collect' | 'like'

const uid = ref('')
const user = ref<any>(null)
const pageError = ref('')
const pageLoading = ref(true)
const activeTab = ref<ProfileTab>('article')
const tabLoading = ref(false)

const articles = ref<any[]>([])
const collects = ref<any[]>([])
const likes = ref<any[]>([])
const tabPages = reactive({ article: 1, collect: 1, like: 1 })
const tabTotals = reactive({ article: 0, collect: 0, like: 0 })
const tabHasMore = reactive({ article: false, collect: false, like: false })

const userStore = useUserStore()
const isSelf = computed(() => {
  const myUid = userStore.userInfo.uid ?? userStore.userInfo.userId
  return myUid > 0 && String(myUid) === uid.value
})

const avatarFrame = computed(() =>
  resolvePublicAvatarFrame(user.value?.loadout?.avatarFrame),
)

const avatarDisplayUrl = computed(() => resolveStaticUrl(user.value?.avatar || ''))

const tabOptions = [
  { key: 'article' as const, label: '已发布', totalKey: 'article' as const },
  { key: 'collect' as const, label: '收藏', totalKey: 'collect' as const },
  { key: 'like' as const, label: '点赞', totalKey: 'like' as const },
]

const currentList = computed(() => {
  if (activeTab.value === 'collect')
    return collects.value
  if (activeTab.value === 'like')
    return likes.value
  return articles.value
})

onLoad(async (query) => {
  uid.value = String(query?.uid ?? '')
  if (!uid.value) {
    pageError.value = '用户不存在'
    pageLoading.value = false
    return
  }
  pageLoading.value = true
  pageError.value = ''
  try {
    user.value = await getPublicUser(uid.value)
    uni.setNavigationBarTitle({ title: user.value?.nickname ?? '用户主页' })
    await loadTabFirstPage('article')
    await loadTabFirstPage('collect')
    await loadTabFirstPage('like')
  }
  catch {
    pageError.value = '用户不存在或加载失败'
    user.value = null
  }
  finally {
    pageLoading.value = false
  }
})

async function fetchTabList(tab: ProfileTab, page: number, pageSize = 10) {
  const params = { page, pageSize }
  if (tab === 'article')
    return getPublicUserArticles(uid.value, params)
  if (tab === 'collect')
    return getPublicUserCollects(uid.value, params)
  return getPublicUserLikes(uid.value, params)
}

async function loadTabFirstPage(tab: ProfileTab) {
  const res = await fetchTabList(tab, 1)
  const items = res?.list ?? []
  tabTotals[tab] = res?.pagination?.total ?? items.length
  tabPages[tab] = 1
  tabHasMore[tab] = items.length < tabTotals[tab]
  if (tab === 'article')
    articles.value = items
  else if (tab === 'collect')
    collects.value = items
  else
    likes.value = items
}

watch(activeTab, async (tab) => {
  const list = tab === 'article' ? articles.value : tab === 'collect' ? collects.value : likes.value
  if (!list.length && !pageLoading.value)
    await loadTabFirstPage(tab)
})

async function loadMoreForTab() {
  if (tabLoading.value || !tabHasMore[activeTab.value])
    return
  tabLoading.value = true
  try {
    const nextPage = tabPages[activeTab.value] + 1
    const res = await fetchTabList(activeTab.value, nextPage)
    const items = res?.list ?? []
    if (activeTab.value === 'collect')
      collects.value = [...collects.value, ...items]
    else if (activeTab.value === 'like')
      likes.value = [...likes.value, ...items]
    else
      articles.value = [...articles.value, ...items]
    tabPages[activeTab.value] = nextPage
    const currentLen = activeTab.value === 'collect'
      ? collects.value.length
      : activeTab.value === 'like'
        ? likes.value.length
        : articles.value.length
    tabHasMore[activeTab.value] = currentLen < tabTotals[activeTab.value]
  }
  finally {
    tabLoading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function itemEmoji(item: { icon?: string }) {
  return item?.icon || '🎖️'
}
</script>

<template>
  <view v-if="pageLoading" class="public-page cyber-page-grid u-page-loading-center">
    <text class="text-tech-subtle">加载中...</text>
  </view>
  <view v-else-if="pageError || !user" class="public-page cyber-page-grid u-page-loading-center">
    <text class="text-tech-subtle">{{ pageError || '用户不存在' }}</text>
  </view>
  <scroll-view v-else scroll-y class="public-page cyber-page-grid u-page-scroll">
    <view class="u-page-body u-stack-4">
      <cyber-card class="cyber-card-pad-sm">
        <view class="u-gap-4 u-flex-row-center items-start">
          <AvatarWithFrame
            :avatar="avatarDisplayUrl"
            :alt="user.nickname"
            :frame="avatarFrame"
            :size="160"
            previewable
          />
          <view class="u-flex-1 min-w-0">
            <text class="block text-xl text-tech font-bold">{{ user.nickname }}</text>
            <view class="public-profile-meta u-gap-2 u-flex-row-center flex-wrap">
              <text class="public-profile-badge">Lv{{ user.level ?? 1 }}</text>
              <text class="text-sm text-tech-muted">声望 {{ user.reputation ?? 0 }}</text>
              <text v-if="user.createTime" class="text-sm text-tech-muted">
                加入于 {{ formatDate(user.createTime).slice(0, 10) }}
              </text>
            </view>
            <text v-if="user.intro" class="mt-2 block text-sm text-tech-muted">{{ user.intro }}</text>
          </view>
        </view>
        <ProfileSocialBar v-if="!isSelf" class="mt-4" :target-uid="Number(uid)" />
      </cyber-card>

      <cyber-card v-if="user.loadout || user.completedAchievements?.length" class="cyber-card-pad-sm">
        <text class="block text-sm text-tech font-semibold">当前装扮</text>
        <view v-if="user.loadout" class="public-loadout-badges u-gap-2 u-flex-row-center flex-wrap">
          <text v-if="user.loadout.title" class="public-loadout-badge">
            {{ itemEmoji(user.loadout.title) }} {{ user.loadout.title.name }}
          </text>
          <text v-if="user.loadout.avatarFrame" class="public-loadout-badge public-loadout-badge--info">
            {{ itemEmoji(user.loadout.avatarFrame) }} {{ user.loadout.avatarFrame.name }}
          </text>
          <text v-if="user.loadout.pet" class="public-loadout-badge public-loadout-badge--success">
            {{ itemEmoji(user.loadout.pet.config || user.loadout.pet) }}
            {{ user.loadout.pet.nickname || user.loadout.pet.config?.name }}
          </text>
        </view>
        <view v-if="user.completedAchievements?.length" class="public-achievements u-gap-2 u-flex-row-center flex-wrap">
          <text
            v-for="ach in user.completedAchievements"
            :key="ach.code"
            class="public-achievement-badge"
          >
            {{ ach.rarityIcon || '🏆' }} {{ ach.name || ach.code }}
          </text>
        </view>
      </cyber-card>

      <cyber-card class="cyber-card-pad-sm">
        <view class="u-action-row u-action-row--loose">
          <view v-for="opt in tabOptions" :key="opt.key">
            <text
              class="cyber-tab"
              :class="activeTab === opt.key ? 'cyber-tab-active' : ''"
              @click="activeTab = opt.key"
            >
              {{ opt.label }} ({{ tabTotals[opt.totalKey] ?? 0 }})
            </text>
          </view>
        </view>

        <view v-if="!currentList.length" class="user-list-state">
          <text class="text-sm text-tech-subtle">暂无内容</text>
        </view>
        <view v-else class="u-stack-3">
          <view
            v-for="item in currentList"
            :key="item.id"
            class="public-article-card"
            @tap="goDetail(item.id)"
          >
            <image
              v-if="item.cover"
              :src="resolveStaticUrl(item.cover)"
              class="public-article-card__cover"
              mode="aspectFill"
            />
            <view v-else class="public-article-card__cover public-article-card__cover--placeholder">
              <text>📄</text>
            </view>
            <view class="u-flex-1 min-w-0">
              <text class="public-article-card__title">
                {{ item.title }}
                <text v-if="item.isMasterpiece" class="public-article-card__masterpiece">神作</text>
              </text>
              <text v-if="item.description" class="public-article-card__desc">{{ item.description }}</text>
              <view class="public-article-card__meta u-gap-2 u-flex-row-center flex-wrap">
                <text>Lv{{ item.articleLevel || 1 }}</text>
                <text>{{ item.views || 0 }} 阅读</text>
                <text>{{ item.likes || 0 }} 点赞</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="tabHasMore[activeTab]" class="user-list-more">
          <view>
            <cyber-button size="small" variant="secondary" :disabled="tabLoading" @click="loadMoreForTab">
              {{ tabLoading ? '加载中...' : '加载更多' }}
            </cyber-button>
          </view>
        </view>
      </cyber-card>
    </view>
  </scroll-view>
</template>

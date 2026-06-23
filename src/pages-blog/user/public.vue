<script lang="ts" setup>
import { getPublicUser, getPublicUserArticles, getPublicUserCollects, getPublicUserLikes } from '@/api/profile'
import ArticleCard from '@/components/article-card/article-card.vue'

definePage({
  style: { navigationBarTitleText: '用户主页' },
})

const uid = ref('')
const user = ref<any>(null)
const activeTab = ref<'article' | 'collect' | 'like'>('article')
const articles = ref<any[]>([])
const collects = ref<any[]>([])
const likes = ref<any[]>([])

onLoad(async (query) => {
  uid.value = String(query?.uid ?? '')
  if (!uid.value)
    return
  user.value = await getPublicUser(uid.value)
  uni.setNavigationBarTitle({ title: user.value?.nickname ?? '用户主页' })
  await loadLists()
})

async function loadLists() {
  const params = { page: 1, pageSize: 20 }
  if (activeTab.value === 'article') {
    articles.value = (await getPublicUserArticles(uid.value, params))?.list ?? []
  }
  else if (activeTab.value === 'collect') {
    collects.value = (await getPublicUserCollects(uid.value, params))?.list ?? []
  }
  else {
    likes.value = (await getPublicUserLikes(uid.value, params))?.list ?? []
  }
}

watch(activeTab, () => {
  void loadLists()
})

const listItems = computed(() => {
  if (activeTab.value === 'article')
    return articles.value
  if (activeTab.value === 'collect')
    return collects.value
  return likes.value
})
</script>

<template>
  <view class="public-page cyber-page-grid">
    <cyber-card v-if="user" class="!p-4">
      <view class="flex items-center gap-3">
        <image :src="user.avatar" class="h-14 w-14 border border-tech rounded-full" />
        <view>
          <text class="block text-tech font-bold">{{ user.nickname }}</text>
          <text class="text-sm text-tech-muted">{{ user.intro }}</text>
        </view>
      </view>
    </cyber-card>

    <scroll-view scroll-x class="cyber-tabs mt-2 px-4 py-2">
      <view class="flex">
        <text
          v-for="tab in [{ key: 'article', label: '文章' }, { key: 'collect', label: '收藏' }, { key: 'like', label: '点赞' }]"
          :key="tab.key"
          class="cyber-tab mr-4 shrink-0"
          :class="activeTab === tab.key ? 'cyber-tab-active' : ''"
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </text>
      </view>
    </scroll-view>

    <view class="p-3">
      <ArticleCard v-for="item in listItems" :key="item.id" :item="item" />
    </view>
  </view>
</template>

<style scoped>
.public-page {
  min-height: 100vh;
}
</style>

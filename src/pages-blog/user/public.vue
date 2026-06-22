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
  <view class="public-page">
    <view v-if="user" class="bg-white p-4">
      <view class="flex items-center gap-3">
        <image :src="user.avatar" class="h-14 w-14 rounded-full" />
        <view>
          <text class="block font-bold">{{ user.nickname }}</text>
          <text class="text-sm text-gray-500">{{ user.intro }}</text>
        </view>
      </view>
    </view>
    <view class="mt-2 flex bg-white px-4 py-2">
      <text
        class="mr-4 text-sm"
        :class="activeTab === 'article' ? 'font-bold text-blue-600' : 'text-gray-500'"
        @click="activeTab = 'article'"
      >
        文章
      </text>
      <text
        class="mr-4 text-sm"
        :class="activeTab === 'collect' ? 'font-bold text-blue-600' : 'text-gray-500'"
        @click="activeTab = 'collect'"
      >
        收藏
      </text>
      <text
        class="text-sm"
        :class="activeTab === 'like' ? 'font-bold text-blue-600' : 'text-gray-500'"
        @click="activeTab = 'like'"
      >
        点赞
      </text>
    </view>
    <view class="p-3">
      <ArticleCard v-for="item in listItems" :key="item.id" :item="item" />
    </view>
  </view>
</template>

<style scoped>
.public-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

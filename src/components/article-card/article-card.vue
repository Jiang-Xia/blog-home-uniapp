<script setup lang="ts">
import type { ArticleItem } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'

defineProps<{
  item: ArticleItem
}>()

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}
</script>

<template>
  <view class="article-card mb-3 rounded-lg bg-white p-3 shadow-sm" @click="goDetail(item.id)">
    <view v-if="item.cover" class="mb-2 overflow-hidden rounded-md">
      <image :src="item.cover" mode="aspectFill" class="h-36 w-full" />
    </view>
    <text class="block text-base text-gray-900 font-medium">{{ item.title }}</text>
    <text v-if="item.description" class="line-clamp-2 mt-1 block text-sm text-gray-500">{{ item.description }}</text>
    <view class="mt-2 flex flex-wrap gap-1">
      <text v-for="tag in item.tags" :key="tag.id" class="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
        {{ tag.name }}
      </text>
    </view>
  </view>
</template>

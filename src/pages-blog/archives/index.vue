<script lang="ts" setup>
import { getArchives } from '@/api/article'
import { ROUTE_DETAIL } from '@/router/routes'
import { formatArchiveDay } from '@/utils/date-time'

definePage({
  style: { navigationBarTitleText: '文章归档' },
})

const archivesList = ref<any[]>([])
const loading = ref(true)
/** 各年份折叠状态，默认展开 */
const expandedYears = ref<Record<string, boolean>>({})

onLoad(async () => {
  try {
    archivesList.value = await getArchives() ?? []
    for (const archive of archivesList.value) {
      expandedYears.value[String(archive.year)] = true
    }
  }
  finally {
    loading.value = false
  }
})

function goDetail(id: number) {
  uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${id}` })
}

function toggleYear(year: string | number) {
  const key = String(year)
  expandedYears.value[key] = !expandedYears.value[key]
}

function isYearExpanded(year: string | number) {
  return expandedYears.value[String(year)] !== false
}
</script>

<template>
  <scroll-view scroll-y class="archives-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-3">
      <cyber-section-header
        class="mb-4"
        label="ARCHIVES"
        title="文章归档"
        subtitle="按年月浏览全部文章"
        align="left"
      />

      <view v-if="loading" class="py-8 text-center text-tech-subtle">
        加载中...
      </view>
      <view v-else-if="!archivesList.length" class="py-8 text-center text-tech-subtle">
        暂无归档
      </view>

      <view v-for="(archive, idx) in archivesList" :key="idx" class="archives-year-block mb-3">
        <cyber-card class="archives-year-card overflow-hidden !p-0">
          <view class="archives-year-header" @tap="toggleYear(archive.year)">
            <view class="archives-year-header-main u-gap-2">
              <text class="cyber-feature-tag">{{ archive.year }}</text>
              <text class="text-base text-tech font-semibold">年文章</text>
            </view>
            <text class="archives-year-toggle text-xs text-tech-subtle">
              {{ isYearExpanded(archive.year) ? '收起' : '展开' }}
            </text>
          </view>

          <view v-if="isYearExpanded(archive.year)" class="archives-year-body border-t border-tech px-3 pb-3 pt-2">
            <view v-for="(articles, month) in archive.data" :key="month" class="archives-month-block mb-3">
              <text class="archives-month-title mb-2 block text-sm text-tech-primary">{{ month }}</text>
              <view
                v-for="item in articles"
                :key="item.id"
                class="cyber-list-row"
                @click="goDetail(item.id)"
              >
                <text class="text-xs text-tech-subtle">{{ formatArchiveDay(item.createTime) }}</text>
                <text class="flex-1 text-sm text-tech">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </cyber-card>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.archives-year-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.archives-year-header-main {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.archives-month-title {
  padding-bottom: 8rpx;
  border-bottom: 1px solid var(--tech-border);
}

.archives-month-block:last-child {
  margin-bottom: 0;
}
</style>

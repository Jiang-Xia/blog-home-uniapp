<script lang="ts" setup>
import { ROUTE_HOME } from '@/router/routes'
import { get404GifUrl } from '@/config/site-config'
import { currRoute } from '@/utils'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '页面不存在' },
})

const failedPath = ref('')
const gifUrl = get404GifUrl()

onLoad((query) => {
  const { query: q } = currRoute()
  failedPath.value = String(query?.path ?? q.path ?? '')
})

function goHome() {
  uni.switchTab({ url: ROUTE_HOME })
}
</script>

<template>
  <view class="not-found-page cyber-page-grid px-6 py-10 text-center">
    <image
      v-if="gifUrl"
      :src="gifUrl"
      mode="aspectFit"
      class="mx-auto mb-6 h-40 w-40 opacity-80"
    />
    <text class="cyber-gradient-text block text-2xl font-light">Page not found</text>
    <text v-if="failedPath" class="mt-3 block break-all text-sm text-tech-subtle">{{ failedPath }}</text>
    <text v-else class="mt-3 block text-sm text-tech-subtle">您访问的页面不存在或已下线</text>
    <cyber-button class="mt-8 inline-flex" variant="primary" @click="goHome">
      返回首页
    </cyber-button>
  </view>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
}
</style>

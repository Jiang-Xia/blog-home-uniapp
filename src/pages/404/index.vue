<script lang="ts" setup>
/**
 * 404 页面
 * - uni.onPageNotFound 重定向至此；展示失败路径并提供回首页
 */
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
  <view class="not-found-page px-6 py-10 text-center">
    <image
      v-if="gifUrl"
      :src="gifUrl"
      mode="aspectFit"
      class="mx-auto mb-6 h-40 w-40 opacity-80"
    />
    <text class="block text-2xl text-gray-700 font-light">Page not found</text>
    <text v-if="failedPath" class="mt-3 block break-all text-sm text-gray-400">{{ failedPath }}</text>
    <text v-else class="mt-3 block text-sm text-gray-400">您访问的页面不存在或已下线</text>
    <wd-button block class="mt-8" @click="goHome">
      返回首页
    </wd-button>
  </view>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: #fff;
}
</style>

<script lang="ts" setup>
const props = defineProps<{
  path: string
  title?: string
}>()

const nuxtHome = import.meta.env.VITE_NUXT_HOME_URL || 'http://localhost:5050'

definePage({
  style: { navigationBarTitleText: 'Web 工具' },
})

const pagePath = ref('')
const pageTitle = ref('Web 工具')

onLoad((query) => {
  pagePath.value = String(query?.path ?? props.path ?? '')
  pageTitle.value = String(query?.title ?? props.title ?? 'Web 工具')
  uni.setNavigationBarTitle({ title: pageTitle.value })
})

const fullUrl = computed(() => `${nuxtHome}${pagePath.value.startsWith('/') ? pagePath.value : `/${pagePath.value}`}`)

function openInBrowser() {
  // #ifdef H5
  window.open(fullUrl.value, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: fullUrl.value,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  })
  // #endif
}
</script>

<template>
  <view class="h5-web-page cyber-page-grid u-page-body py-8 text-center">
    <text class="block text-lg text-tech font-bold">{{ pageTitle }}</text>
    <text class="mt-4 block break-all text-sm text-tech-subtle">{{ fullUrl }}</text>
    <text class="mt-4 block text-sm text-tech-muted">该工具依赖 Web 能力（WebRTC、光影边框、PDF 签名等），请在浏览器打开 blog-home-nuxt 完整版。</text>
    <wd-button block class="mt-6" @click="openInBrowser">
      <!-- #ifdef H5 -->在浏览器打开<!-- #endif -->
      <!-- #ifndef H5 -->复制链接<!-- #endif -->
    </wd-button>
  </view>
</template>

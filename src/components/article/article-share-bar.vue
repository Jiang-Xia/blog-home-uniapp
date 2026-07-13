<script lang="ts" setup>
/**
 * 详情页分享条（对齐 blog-home-nuxt ArticleShareBar）
 */
import { isH5 } from '@uni-helper/uni-env'
import { ROUTE_DETAIL } from '@/router/routes'

const props = defineProps<{
  articleId?: string | number
  title?: string
}>()

const sharePath = computed(() =>
  props.articleId ? `${ROUTE_DETAIL}?id=${props.articleId}` : '',
)

function copyLink() {
  if (!props.articleId)
    return
  let url = sharePath.value
  // #ifdef H5
  if (typeof window !== 'undefined')
    url = `${window.location.origin}/#${sharePath.value}`
  // #endif
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    },
  })
}

function shareNative() {
  if (!isH5 || typeof navigator === 'undefined')
    return copyLink()
  if (navigator.share) {
    const url = `${window.location.origin}/#${sharePath.value}`
    void navigator.share({
      title: props.title || '文章分享',
      url,
    }).catch(() => copyLink())
    return
  }
  copyLink()
}
</script>

<template>
  <view v-if="articleId" class="article-share-bar u-gap-2 mt-4 flex flex-wrap items-center">
    <text class="text-xs text-tech-subtle">分享</text>
    <view>
      <cyber-button size="small" variant="secondary" @click="copyLink">
        复制链接
      </cyber-button>
    </view>
    <!-- #ifdef H5 -->
    <view>
      <cyber-button size="small" variant="secondary" @click="shareNative">
        分享
      </cyber-button>
    </view>
    <!-- #endif -->
  </view>
</template>

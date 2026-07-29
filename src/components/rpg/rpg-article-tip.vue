<script lang="ts" setup>
/**
 * 文章打赏面板（对齐 Nuxt ArticleTipPanel）
 * - POST /rpg/article/tip；不可打赏自己的文章
 */
import { tipArticle } from '@/api/rpg'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { toast, toastSuccess } from '@/utils/toast'

const props = withDefaults(defineProps<{
  articleId: number
  authorUid: number
  /** 嵌入 FAB 弹层时使用，去掉外层卡片样式 */
  embedded?: boolean
}>(), {
  embedded: false,
})

const emit = defineEmits<{ tipped: [] }>()

const tokenStore = useTokenStore()
const userStore = useUserStore()
const amount = ref(50)
const loading = ref(false)

const canTip = computed(() => {
  return tokenStore.hasLogin
    && userStore.userInfo.userId > 0
    && userStore.userInfo.userId !== props.authorUid
})

/** 提交打赏 */
async function submitTip() {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  if (userStore.userInfo.userId === props.authorUid) {
    toast('不能打赏自己的文章')
    return
  }
  if (amount.value < 1) {
    toast('打赏数量至少为 1')
    return
  }
  loading.value = true
  try {
    await tipArticle(props.articleId, amount.value)
    toastSuccess(`打赏 ${amount.value} 钻石成功`)
    emit('tipped')
  }
  catch {
    // 失败文案已由 http 展示后端 message（如钻石不足）
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <view v-if="canTip" :class="embedded ? 'tip-panel-embedded' : 'tip-panel cyber-glass-card cyber-card-pad-sm mt-4'">
    <view v-if="!embedded" class="mb-2 flex items-center">
      <cyber-icon name="gem" size="32rpx" />
      <text class="ml-2 text-sm text-tech font-medium">打赏作者</text>
    </view>
    <view class="u-captcha-row u-captcha-row-flush">
      <view class="u-captcha-input-wrap">
        <wd-input v-model.number="amount" type="number" placeholder="钻石数量" />
      </view>
      <view class="u-captcha-side-btn">
        <wd-button size="small" :loading="loading" @click="submitTip">
          打赏
        </wd-button>
      </view>
    </view>
  </view>
  <view v-else-if="embedded" class="tip-panel-embedded">
    <text class="block text-sm text-tech-muted">不能打赏自己的文章</text>
  </view>
</template>

<style scoped>
.tip-panel-embedded {
  padding: 0;
}
</style>

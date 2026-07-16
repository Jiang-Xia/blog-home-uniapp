<script lang="ts" setup>
/**
 * 文章详情 Hero 社交栏（对齐 blog-home-nuxt ArticleHeroSocialBar）
 * 加油 / 扔鸡蛋 / 送花 / 打赏
 */
import type { RpgSfxKey } from '@/constants/rpg-audio'
import { socialCheer, socialEgg, socialFlower } from '@/api/rpg'
import RpgArticleTip from '@/components/rpg/rpg-article-tip.vue'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { LOGIN_PAGE } from '@/router/config'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

const props = defineProps<{
  authorUid: number
  articleId: number | string
}>()

const emit = defineEmits<{ tipped: [] }>()

const tokenStore = useTokenStore()
const userStore = useUserStore()
const loading = ref(false)
const showTipPopup = ref(false)
const { playSfx } = useRpgAudio()

const isAuthor = computed(() =>
  userStore.userInfo.userId > 0 && userStore.userInfo.userId === props.authorUid,
)

function ensureLogin() {
  if (tokenStore.hasLogin)
    return true
  uni.showToast({ title: '请先登录', icon: 'none' })
  uni.navigateTo({ url: LOGIN_PAGE })
  return false
}

async function act(
  fn: () => Promise<any>,
  getLabel?: (res: any) => string,
  sfx?: RpgSfxKey,
) {
  if (!ensureLogin())
    return
  if (isAuthor.value) {
    uni.showToast({ title: '不能对自己操作', icon: 'none' })
    return
  }
  if (loading.value)
    return
  loading.value = true
  try {
    const res = await fn()
    if (sfx)
      void playSfx(sfx)
    uni.showToast({
      title: getLabel ? getLabel(res) : '操作成功',
      icon: 'success',
    })
  }
  catch {
    // http 层已 toast 业务错误
  }
  finally {
    loading.value = false
  }
}

function onCheer() {
  void act(
    () => socialCheer(props.authorUid),
    res => `加油成功，对方 +${Math.abs(res?.hpDelta ?? 10)} 生命`,
    'socialCheer',
  )
}

function onEgg() {
  void act(() => socialEgg(props.authorUid), () => '扔鸡蛋成功', 'socialEgg')
}

function onFlower() {
  void act(() => socialFlower(props.authorUid), () => '送鲜花成功', 'socialFlower')
}

function openTip() {
  if (!ensureLogin())
    return
  if (isAuthor.value) {
    uni.showToast({ title: '不能打赏自己', icon: 'none' })
    return
  }
  showTipPopup.value = true
}

function onTipped() {
  showTipPopup.value = false
  emit('tipped')
}
</script>

<template>
  <view v-if="authorUid && !isAuthor" class="hero-social-bar">
    <view class="hero-social-actions u-gap-2 flex flex-wrap justify-center">
      <view>
        <cyber-button size="small" variant="secondary" :disabled="loading" @click="onCheer">
          👏 加油
        </cyber-button>
      </view>
      <view>
        <cyber-button size="small" variant="secondary" :disabled="loading" @click="onEgg">
          🥚 扔鸡蛋
        </cyber-button>
      </view>
      <view>
        <cyber-button size="small" variant="secondary" :disabled="loading" @click="onFlower">
          🌸 送鲜花
        </cyber-button>
      </view>
      <view>
        <cyber-button size="small" variant="primary" :disabled="loading" @click="openTip">
          💎 打赏作者
        </cyber-button>
      </view>
    </view>
  </view>

  <wd-popup v-model="showTipPopup" position="bottom" closable @close="showTipPopup = false">
    <view class="tip-popup cyber-page p-4">
      <text class="mb-3 block text-lg text-tech font-bold">💎 打赏作者</text>
      <RpgArticleTip
        :article-id="Number(articleId)"
        :author-uid="authorUid"
        embedded
        @tipped="onTipped"
      />
    </view>
  </wd-popup>
</template>

<style scoped>
.hero-social-bar {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-social-actions {
  justify-content: center;
}
</style>

<script lang="ts" setup>
/**
 * 公开主页社交栏（对齐 blog-home-nuxt components/rpg/ProfileSocialBar.vue）
 * 加油 / 扔鸡蛋 / 送花
 */
import type { RpgSfxKey } from '@/constants/rpg-audio'
import { socialCheer, socialEgg, socialFlower } from '@/api/rpg'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

const props = defineProps<{ targetUid: number }>()

const tokenStore = useTokenStore()
const loading = ref(false)
const { playSfx } = useRpgAudio()

async function act(
  fn: () => Promise<any>,
  getLabel?: (res: any) => string,
  sfx: RpgSfxKey = 'uiClick',
) {
  if (!tokenStore.hasLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.navigateTo({ url: LOGIN_PAGE })
    return
  }
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
  catch (e: any) {
    const msg = e?.message || e?.msg || '操作失败'
    uni.showToast({ title: msg, icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

function onCheer() {
  void act(
    () => socialCheer(props.targetUid),
    res => `加油成功，对方 +${Math.abs(res?.hpDelta ?? 10)} 生命`,
  )
}

function onEgg() {
  void act(() => socialEgg(props.targetUid), () => '扔鸡蛋成功')
}

function onFlower() {
  void act(() => socialFlower(props.targetUid), () => '送鲜花成功')
}
</script>

<template>
  <view class="profile-social-bar u-gap-2 u-flex-row-center flex-wrap">
    <view>
      <cyber-button size="small" variant="secondary" :disabled="loading" @click="onCheer">
        👏 加油
      </cyber-button>
    </view>
    <view>
      <cyber-button size="small" variant="secondary" :disabled="loading" @click="onEgg">
        🥚 扔鸡蛋 (-15钻石)
      </cyber-button>
    </view>
    <view>
      <cyber-button size="small" variant="secondary" :disabled="loading" @click="onFlower">
        🌸 送鲜花 (-10钻石)
      </cyber-button>
    </view>
  </view>
</template>

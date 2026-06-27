<script lang="ts" setup>
/**
 * 用户名片卡片（对齐 blog-home-nuxt components/user/business-card.vue）
 * 展示基础资料、内联编辑、RPG 入口
 */
import AvatarWithFrame from '@/components/user/avatar-with-frame.vue'
import ProfileEditForm from '@/components/user/profile-edit-form.vue'
import { useEquippedAvatarFrame } from '@/composables/use-equipped-avatar-frame'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { ROUTE_RPG_FULL, ROUTE_USER_PUBLIC } from '@/router/routes'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { openExternalUrl } from '@/utils/open-external-url'
import { resolveStaticUrl } from '@/utils/static-url'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { playSfx } = useRpgAudio()
const { frame: avatarFrame, refresh: refreshFrame } = useEquippedAvatarFrame()

const editing = ref(false)

const avatarDisplayUrl = computed(() => resolveStaticUrl(userInfo.value.avatar || ''))

const displayHomepage = computed(() => {
  const url = userInfo.value.homepage || ''
  if (!url)
    return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  }
  catch {
    return url.length > 32 ? `${url.slice(0, 32)}…` : url
  }
})

const uidText = computed(() => {
  const uid = userInfo.value.uid ?? userInfo.value.userId
  return uid && uid > 0 ? String(uid) : ''
})

const publicProfileUrl = computed(() =>
  uidText.value ? `${ROUTE_USER_PUBLIC}?uid=${uidText.value}` : '',
)

function copyUid() {
  if (!uidText.value)
    return
  uni.setClipboardData({
    data: uidText.value,
    success: () => uni.showToast({ title: 'UID 已复制', icon: 'success' }),
    fail: () => uni.showToast({ title: '复制失败', icon: 'none' }),
  })
}

function startEdit() {
  editing.value = true
}

function finishEdit() {
  editing.value = false
  void refreshFrame()
}

function goPublicProfile() {
  if (!publicProfileUrl.value)
    return
  uni.navigateTo({ url: publicProfileUrl.value })
}

function openHomepage() {
  const url = userInfo.value.homepage
  if (url)
    openExternalUrl(url)
}

function goRpg() {
  void playSfx('uiClick')
  uni.navigateTo({ url: ROUTE_RPG_FULL })
}

onMounted(() => {
  void refreshFrame()
})
</script>

<template>
  <view class="business-card">
    <view class="business-card__header">
      <view v-if="!editing" class="business-card__edit-btn-wrap">
        <cyber-button size="small" variant="secondary" @click="startEdit">
          编辑资料
        </cyber-button>
      </view>
      <view class="business-card__avatar-wrap">
        <AvatarWithFrame
          :avatar="avatarDisplayUrl"
          :alt="userInfo.nickname"
          :frame="avatarFrame"
          :size="176"
          previewable
        />
      </view>
    </view>

    <view class="business-card__body">
      <view v-if="editing">
        <text class="business-card__edit-title">编辑个人资料</text>
        <ProfileEditForm @saved="finishEdit" @cancel="finishEdit" />
      </view>

      <template v-else>
        <view class="business-card__intro-block">
          <text class="business-card__nickname">{{ userInfo.nickname || '访客' }}</text>
          <text v-if="userInfo.role" class="business-card__role-badge">{{ userInfo.role }}</text>
          <text v-if="userInfo.intro" class="business-card__intro">{{ userInfo.intro }}</text>
        </view>

        <view
          v-if="publicProfileUrl || userInfo.homepage || uidText"
          class="business-card__links"
        >
          <view v-if="publicProfileUrl" class="business-card__link-row u-flex-row-center u-gap-2">
            <text class="business-card__link-label">站内</text>
            <text class="business-card__link-action" @click="goPublicProfile">公开主页</text>
          </view>
          <view v-if="userInfo.homepage" class="business-card__link-row u-flex-row-center u-gap-2">
            <text class="business-card__link-label">主页</text>
            <text class="business-card__link-action" @click="openHomepage">
              {{ displayHomepage || userInfo.homepage }}
            </text>
          </view>
          <view v-if="uidText" class="business-card__link-row u-flex-row-center u-gap-2">
            <text class="business-card__link-label">UID</text>
            <text class="business-card__uid">{{ uidText }}</text>
            <text class="business-card__link-action" @click="copyUid">复制</text>
          </view>
        </view>

        <view
          v-if="!userInfo.intro && !userInfo.homepage"
          class="business-card__empty-hint"
        >
          <text class="business-card__empty-icon">✨</text>
          <text class="business-card__empty-text">完善个人资料，让名片更有辨识度</text>
          <view class="business-card__empty-action">
            <cyber-button size="small" variant="primary" @click="startEdit">
              去完善资料
            </cyber-button>
          </view>
        </view>

        <view class="business-card__rpg-entry" @click="goRpg">
          <text class="business-card__rpg-icon">⚔️</text>
          <view class="business-card__rpg-text">
            <text class="business-card__rpg-title">进入 RPG 冒险</text>
            <text class="business-card__rpg-desc">签到 · 升级 · 任务 · 排行榜</text>
          </view>
          <cyber-chevron />
        </view>
      </template>
    </view>
  </view>
</template>

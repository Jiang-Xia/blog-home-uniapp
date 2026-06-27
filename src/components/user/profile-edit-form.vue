<script lang="ts" setup>
/**
 * 个人资料编辑表单（对齐 blog-home-nuxt components/user/profile-edit-form.vue）
 * 数据来源：GET /user/info、PATCH /user/edit、POST /resources/upload-media?category=avatar
 */
import { updateUserProfile, uploadAvatar } from '@/api/resources'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { resolveStaticUrl } from '@/utils/static-url'

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const DEFAULT_AVATAR = '/static/images/default-avatar.png'

const form = reactive({
  nickname: '',
  intro: '',
  homepage: '',
  avatar: '',
})

const avatarUploading = ref(false)
const submitting = ref(false)

const avatarDisplayUrl = computed(() => resolveStaticUrl(form.avatar || DEFAULT_AVATAR))

function syncFormFromUser() {
  const info = userInfo.value
  const uid = info.uid ?? info.userId
  if (!uid || uid <= 0)
    return
  form.nickname = info.nickname || ''
  form.intro = info.intro || ''
  form.homepage = info.homepage || ''
  form.avatar = info.avatar || DEFAULT_AVATAR
}

watch(userInfo, syncFormFromUser, { immediate: true, deep: true })

function onAvatarError() {
  form.avatar = DEFAULT_AVATAR
}

/** 小程序/H5 统一：chooseImage + uploadAvatar */
async function chooseAvatar() {
  if (avatarUploading.value)
    return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      if (!filePath)
        return
      avatarUploading.value = true
      try {
        const url = await uploadAvatar(filePath)
        form.avatar = resolveStaticUrl(url)
      }
      catch {
        uni.showToast({ title: '头像上传失败', icon: 'none' })
      }
      finally {
        avatarUploading.value = false
      }
    },
  })
}

async function handleSubmit() {
  const nickname = form.nickname.trim()
  if (!nickname) {
    uni.showToast({ title: '请填写昵称', icon: 'none' })
    return
  }
  const uid = userInfo.value.uid ?? userInfo.value.userId
  if (!uid || uid <= 0) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await updateUserProfile({
      id: uid,
      nickname,
      intro: form.intro.trim(),
      homepage: form.homepage.trim(),
      avatar: form.avatar,
    })
    await userStore.fetchUserInfo()
    uni.showToast({ title: '资料已保存', icon: 'success' })
    emit('saved')
  }
  catch {
    // 错误由全局拦截器处理
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="u-stack-4">
    <view class="u-gap-4 u-flex-row-center">
      <view class="profile-edit-avatar-wrap">
        <image
          :src="avatarDisplayUrl"
          class="profile-edit-avatar"
          mode="aspectFill"
          @error="onAvatarError"
        />
      </view>
      <view>
        <cyber-button
          size="small"
          variant="secondary"
          :disabled="avatarUploading"
          @click="chooseAvatar"
        >
          {{ avatarUploading ? '上传中...' : '更换头像' }}
        </cyber-button>
      </view>
    </view>

    <wd-input v-model="form.nickname" label="昵称" placeholder="昵称（最多6字）" :maxlength="6" clearable />
    <wd-textarea
      v-model="form.intro"
      label="个人简介"
      placeholder="一句话介绍自己（选填）"
      :maxlength="120"
      auto-height
    />
    <wd-input
      v-model="form.homepage"
      label="个人主页"
      placeholder="https://example.com（选填）"
      :maxlength="200"
      clearable
    />

    <view class="u-gap-3 u-flex-row-center flex-wrap">
      <view>
        <cyber-button
          size="small"
          variant="primary"
          :disabled="submitting || avatarUploading"
          @click="handleSubmit"
        >
          {{ submitting ? '保存中...' : '保存资料' }}
        </cyber-button>
      </view>
      <view>
        <cyber-button size="small" variant="secondary" :disabled="submitting" @click="emit('cancel')">
          取消
        </cyber-button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.profile-edit-avatar-wrap {
  width: 128rpx;
  height: 128rpx;
  overflow: hidden;
  border-radius: 9999px;
  border: 2px solid var(--tech-border);
}

.profile-edit-avatar {
  width: 100%;
  height: 100%;
}
</style>

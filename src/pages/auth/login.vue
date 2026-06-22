<script lang="ts" setup>
/**
 * 登录页
 * - 账号/邮箱登录；H5 支持 GitHub OAuth 与 ticket 回调兑换
 * - 成功后按 redirect 回跳（仅允许 /pages/ 内路径）
 */
import { getAuthCode, getGithubOAuthUrl } from '@/api/login'
import { ROUTE_HOME } from '@/router/routes'
import { useTokenStore } from '@/store/token'
import { currRoute } from '@/utils'
import { rsaEncrypt } from '@/utils/rsa'

definePage({
  style: { navigationBarTitleText: '登录' },
})

const tokenStore = useTokenStore()
const loginType = ref<'account' | 'email'>('account')
const submitting = ref(false)
const oauthTicketLoading = ref(false)
const githubLoginLoading = ref(false)
const captchaId = ref('')
const captchaImage = ref('')
const form = reactive({
  username: '',
  email: '',
  password: '',
  authCode: '',
  verificationCode: '',
})

/** 加载图形验证码 GET /user/authCode */
async function loadCaptcha() {
  try {
    const res = await getAuthCode()
    captchaImage.value = `data:image/svg+xml;base64,${res.captchaBase64}`
    captchaId.value = res.captchaId
  }
  catch {
    captchaImage.value = ''
  }
}

/** OAuth 回调 ?ticket= 兑换 token；成功后清除 URL 参数 */
async function handleOAuthTicket(ticket: string) {
  if (oauthTicketLoading.value || tokenStore.hasLogin)
    return
  oauthTicketLoading.value = true
  uni.showLoading({ title: '正在完成登录...' })
  try {
    await tokenStore.loginByOAuthTicket(ticket)
    navigateAfterLogin()
  }
  catch {
    // toast 已在 store 内提示
  }
  finally {
    oauthTicketLoading.value = false
    uni.hideLoading()
    // #ifdef H5
    if (typeof window !== 'undefined')
      window.history.replaceState({}, '', window.location.pathname)
    // #endif
  }
}

/** 登录成功后跳转（与 handleLogin 共用） */
function navigateAfterLogin() {
  const { query } = currRoute()
  const redirect = query.redirect ? decodeURIComponent(String(query.redirect)) : ROUTE_HOME
  if (redirect.startsWith('/pages/')) {
    const tabPages = ['/pages/index/index', '/pages/explore/explore', '/pages/rpg/entry', '/pages/me/me']
    if (tabPages.includes(redirect.split('?')[0])) {
      uni.switchTab({ url: redirect.split('?')[0] })
    }
    else {
      uni.redirectTo({ url: redirect })
    }
  }
  else {
    uni.switchTab({ url: ROUTE_HOME })
  }
}

onLoad((query) => {
  void loadCaptcha()
  // #ifdef H5
  if (query?.accessToken || query?.refreshToken) {
    uni.showToast({ title: 'URL 携带敏感登录信息已拦截', icon: 'none' })
    if (typeof window !== 'undefined')
      window.history.replaceState({}, '', window.location.pathname)
    return
  }
  if (query?.ticket)
    void handleOAuthTicket(String(query.ticket))
  // #endif
})

async function handleLogin() {
  if (submitting.value || tokenStore.hasLogin)
    return
  submitting.value = true
  try {
    if (loginType.value === 'account') {
      if (!form.username || !form.password || !form.authCode) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      await tokenStore.login({
        username: form.username,
        password: rsaEncrypt(form.password),
        authCode: form.authCode,
        captchaId: captchaId.value,
      })
    }
    else {
      if (!form.email || !form.verificationCode) {
        uni.showToast({ title: '请填写邮箱与验证码', icon: 'none' })
        return
      }
      await tokenStore.loginByEmail({
        email: form.email,
        verificationCode: form.verificationCode,
      })
    }
    navigateAfterLogin()
  }
  catch {
    if (loginType.value === 'account') {
      form.authCode = ''
      void loadCaptcha()
    }
  }
  finally {
    submitting.value = false
  }
}

// #ifdef H5
/** H5 跳转 server GitHub 授权页 */
function githubLogin() {
  githubLoginLoading.value = true
  uni.showToast({ title: '正在跳转 GitHub...', icon: 'none' })
  window.location.href = getGithubOAuthUrl()
}
// #endif

// #ifdef MP-WEIXIN
async function wxLogin() {
  if (submitting.value || tokenStore.hasLogin)
    return
  submitting.value = true
  try {
    await tokenStore.wxLogin()
    navigateAfterLogin()
  }
  finally {
    submitting.value = false
  }
}
// #endif
</script>

<template>
  <view class="login-page px-4 py-6">
    <view class="mb-6 flex gap-4">
      <text
        class="text-base"
        :class="loginType === 'account' ? 'text-primary font-bold' : 'text-gray-500'"
        @click="loginType = 'account'"
      >
        账号登录
      </text>
      <text
        class="text-base"
        :class="loginType === 'email' ? 'text-primary font-bold' : 'text-gray-500'"
        @click="loginType = 'email'"
      >
        邮箱登录
      </text>
    </view>

    <template v-if="loginType === 'account'">
      <wd-input v-model="form.username" label="用户名" placeholder="请输入用户名" clearable />
      <wd-input v-model="form.password" label="密码" placeholder="请输入密码" show-password clearable />
      <view class="mt-3 flex items-center gap-2">
        <wd-input v-model="form.authCode" label="验证码" placeholder="验证码" class="flex-1" />
        <image
          v-if="captchaImage"
          :src="captchaImage"
          class="h-10 w-24 border border-gray-200"
          mode="aspectFit"
          @click="loadCaptcha"
        />
      </view>
    </template>
    <template v-else>
      <wd-input v-model="form.email" label="邮箱" placeholder="请输入邮箱" clearable />
      <wd-input v-model="form.verificationCode" label="验证码" placeholder="邮箱验证码" clearable />
    </template>

    <wd-button block class="mt-6" :loading="submitting || oauthTicketLoading" @click="handleLogin">
      登录
    </wd-button>

    <!-- #ifdef H5 -->
    <wd-button block class="mt-3" :loading="githubLoginLoading" @click="githubLogin">
      GitHub 登录
    </wd-button>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <wd-button block class="mt-3" :loading="submitting" @click="wxLogin">
      微信登录
    </wd-button>
    <!-- #endif -->

    <navigator url="/pages/auth/register" open-type="navigate" class="mt-4 text-center text-sm text-gray-500">
      没有账号？去注册
    </navigator>
  </view>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
}
.text-primary {
  color: #2563eb;
}
</style>

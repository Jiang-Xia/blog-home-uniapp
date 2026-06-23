<script lang="ts" setup>
import { emailRegister, getAuthCode, register, sendEmailCode } from '@/api/login'
import { ROUTE_LOGIN } from '@/router/routes'
import { rsaEncrypt } from '@/utils/rsa'

definePage({
  style: { navigationBarTitleText: '注册' },
})

const registerType = ref<'account' | 'email'>('account')
const submitting = ref(false)
const captchaId = ref('')
const captchaImage = ref('')
const emailCodeText = ref('获取验证码')
const emailCodeDisabled = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
  passwordRepeat: '',
  nickname: '冒险者',
  authCode: '',
  verificationCode: '',
})

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

onLoad(() => {
  void loadCaptcha()
})

async function handleSendEmailCode() {
  if (!form.email || emailCodeDisabled.value)
    return
  try {
    await sendEmailCode(form.email, 'register')
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    let countdown = 60
    emailCodeDisabled.value = true
    const timer = setInterval(() => {
      countdown--
      emailCodeText.value = `${countdown}s`
      if (countdown <= 0) {
        clearInterval(timer)
        emailCodeText.value = '获取验证码'
        emailCodeDisabled.value = false
      }
    }, 1000)
  }
  catch { /* handled by http */ }
}

async function handleRegister() {
  if (submitting.value)
    return
  submitting.value = true
  try {
    if (registerType.value === 'account') {
      if (!form.username || !form.password || !form.authCode) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      if (form.password !== form.passwordRepeat) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }
      await register({
        username: form.username,
        password: rsaEncrypt(form.password),
        passwordRepeat: rsaEncrypt(form.passwordRepeat),
        nickname: form.nickname,
        authCode: form.authCode,
        captchaId: captchaId.value,
      })
    }
    else {
      await emailRegister({
        email: form.email,
        password: rsaEncrypt(form.password),
        passwordRepeat: rsaEncrypt(form.passwordRepeat),
        nickname: form.nickname,
        verificationCode: form.verificationCode,
      })
    }
    uni.showToast({ title: '注册成功', icon: 'success' })
    uni.redirectTo({ url: ROUTE_LOGIN })
  }
  catch {
    if (registerType.value === 'account') {
      form.authCode = ''
      void loadCaptcha()
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="register-page cyber-page-grid px-4 py-6">
    <cyber-section-header
      class="mb-6"
      label="AUTH"
      title="注册"
      subtitle="创建账号，开启冒险之旅"
      align="left"
    />

    <view class="mb-6 flex gap-4">
      <text
        class="cyber-auth-tab"
        :class="registerType === 'account' ? 'cyber-auth-tab-active' : ''"
        @click="registerType = 'account'"
      >
        账号注册
      </text>
      <text
        class="cyber-auth-tab"
        :class="registerType === 'email' ? 'cyber-auth-tab-active' : ''"
        @click="registerType = 'email'"
      >
        邮箱注册
      </text>
    </view>

    <cyber-card class="!p-4">
      <template v-if="registerType === 'account'">
        <wd-input v-model="form.username" label="用户名" placeholder="用户名" clearable />
        <wd-input v-model="form.nickname" label="昵称" placeholder="昵称" clearable />
        <wd-input v-model="form.password" label="密码" show-password clearable />
        <wd-input v-model="form.passwordRepeat" label="确认密码" show-password clearable />
        <view class="mt-3 flex items-center gap-2">
          <wd-input v-model="form.authCode" label="验证码" placeholder="验证码" class="flex-1" />
          <image v-if="captchaImage" :src="captchaImage" class="h-10 w-24 border border-tech rounded" @click="loadCaptcha" />
        </view>
      </template>
      <template v-else>
        <wd-input v-model="form.email" label="邮箱" clearable />
        <wd-input v-model="form.nickname" label="昵称" clearable />
        <wd-input v-model="form.password" label="密码" show-password clearable />
        <wd-input v-model="form.passwordRepeat" label="确认密码" show-password clearable />
        <view class="mt-3 flex items-center gap-2">
          <wd-input v-model="form.verificationCode" label="邮箱验证码" class="flex-1" />
          <wd-button size="small" :disabled="emailCodeDisabled" @click="handleSendEmailCode">
            {{ emailCodeText }}
          </wd-button>
        </view>
      </template>

      <cyber-button block class="mt-6" @click="handleRegister">
        注册
      </cyber-button>
    </cyber-card>

    <navigator url="/pages/auth/login" open-type="navigate" class="mt-4 text-center text-sm text-tech-muted">
      已有账号？去登录
    </navigator>
  </view>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
}
</style>

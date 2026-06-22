/**
 * 用户认证 API（对齐 blog-server / blog-home-nuxt）
 */
import type { IAuthLoginRes, ICaptcha, ILoginForm, ILoginResult, IRegisterForm, IUserInfoRes } from './types/login'
import { http } from '@/http/http'
import { getEnvBaseUrl } from '@/utils'
import { normalizeLoginPayload, pickAccessToken, pickRefreshToken } from '@/utils/auth-token'
import { mapServerUser } from '@/utils/user-map'

/** accessToken 有效期 0.5h，refreshToken 7d（与 server certificate 一致） */
export const ACCESS_TOKEN_EXPIRES = 30 * 60
export const REFRESH_TOKEN_EXPIRES = 7 * 24 * 3600

export function toTokenInfo(data: unknown): IAuthLoginRes {
  const payload = normalizeLoginPayload(data)
  const accessToken = pickAccessToken(payload)
  const refreshToken = pickRefreshToken(payload)
  if (!accessToken)
    throw new Error('登录响应缺少 accessToken')
  return {
    accessToken,
    refreshToken,
    accessExpiresIn: ACCESS_TOKEN_EXPIRES,
    refreshExpiresIn: REFRESH_TOKEN_EXPIRES,
  }
}

/** 图形验证码 GET /user/authCode */
export function getAuthCode() {
  return http.get<ICaptcha>('/user/authCode', { t: Date.now() })
}

/** 账号登录 POST /user/login */
export function login(loginForm: ILoginForm) {
  return http.post<ILoginResult>('/user/login', {
    loginType: 'account',
    username: loginForm.username,
    password: loginForm.password,
    authCode: loginForm.authCode,
    captchaId: loginForm.captchaId,
  })
}

/** 邮箱登录 POST /user/email/login */
export function emailLogin(params: { email: string, verificationCode: string }) {
  return http.post<ILoginResult>('/user/email/login', {
    loginType: 'email',
    ...params,
  })
}

/** 刷新 token GET /user/refresh */
export function refreshToken(refreshTokenValue: string) {
  return http.get<{
    accessToken: string
    refreshToken: string
    user?: Record<string, unknown>
  }>('/user/refresh', { token: refreshTokenValue })
}

/** 用户信息 GET /user/info */
export async function getUserInfo() {
  const data = await http.get<Record<string, unknown>>('/user/info')
  return mapServerUser(data) as IUserInfoRes
}

/** 退出（本地清除为主，server 无专用 logout 时可忽略错误） */
export function logout() {
  return Promise.resolve()
}

/** 账号注册 POST /user/register */
export function register(form: IRegisterForm) {
  return http.post<void>('/user/register', form)
}

/** 发送邮箱验证码 POST /user/email/sendCode */
export function sendEmailCode(email: string, type: 'login' | 'register' = 'register') {
  return http.post<void>('/user/email/sendCode', { email, type })
}

/** 邮箱注册 POST /user/email/register */
export function emailRegister(form: Record<string, unknown>) {
  return http.post<void>('/user/email/register', form)
}

/** 微信登录凭证（仅小程序/App） */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(String(err))),
    })
  })
}

/** 微信小程序登录 POST /user/auth/wechat/miniprogram */
export function wxLogin(codeRes: UniApp.LoginRes): Promise<ILoginResult> {
  const code = typeof codeRes === 'object' && codeRes?.code ? codeRes.code : String(codeRes)
  return http.post<ILoginResult>('/user/auth/wechat/miniprogram', { code })
}

/** GitHub OAuth 跳转地址（H5 整页跳转至 server 授权） */
export function getGithubOAuthUrl() {
  return `${getEnvBaseUrl()}/user/auth/github`
}

/** OAuth 回调 ticket 兑换 POST /user/auth/ticket/exchange */
export function exchangeOAuthTicket(ticket: string) {
  return http.post<ILoginResult>('/user/auth/ticket/exchange', { ticket })
}

export type { ILoginForm }

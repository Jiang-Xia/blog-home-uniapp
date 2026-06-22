export type AuthMode = 'single' | 'double'

export interface ISingleTokenRes {
  token: string
  expiresIn: number
}

export interface IDoubleTokenRes {
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
  refreshExpiresIn: number
}

export type IAuthLoginRes = ISingleTokenRes | IDoubleTokenRes

export interface ILoginForm {
  username: string
  password: string
  authCode: string
  captchaId: string
}

export interface IRegisterForm {
  username: string
  password: string
  passwordRepeat: string
  nickname: string
  avatar?: string
  authCode: string
  captchaId: string
}

export interface ILoginResult {
  info: {
    accessToken: string
    refreshToken: string
    token: string
    user: Record<string, unknown>
  }
}

export type UserRole = string

export interface IUserInfoRes {
  userId: number
  username: string
  nickname: string
  avatar?: string
  homepage?: string
  intro?: string
  uid?: number
  role?: UserRole
  roles?: UserRole[]
  [key: string]: unknown
}

export interface ICaptcha {
  captchaBase64: string
  captchaId: string
}

export function isSingleTokenRes(tokenRes: IAuthLoginRes): tokenRes is ISingleTokenRes {
  return 'token' in tokenRes && !('refreshToken' in tokenRes)
}

export function isDoubleTokenRes(tokenRes: IAuthLoginRes): tokenRes is IDoubleTokenRes {
  return 'accessToken' in tokenRes && 'refreshToken' in tokenRes
}

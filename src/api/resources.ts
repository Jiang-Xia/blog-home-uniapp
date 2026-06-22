/**
 * 媒体与用户资料 API（对齐 blog-home-nuxt/api/resources.ts）
 * - 封面/正文/头像上传 POST /resources/upload-media
 */
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils'
import { getPersistedAccessToken } from '@/utils/auth-token'
import { http } from '@/http/http'

export type UploadMediaCategory = 'avatar' | 'cover' | 'article'

/** 读取 Bearer token，供 uni.uploadFile / H5 fetch 上传共用 */
function getUploadAuthHeader(): Record<string, string> {
  const token = useTokenStore().updateNowTime().validToken || getPersistedAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** 小程序/App：本地临时路径上传，返回 /static 相对路径 */
export function uploadMedia(filePath: string, category: UploadMediaCategory): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${getEnvBaseUrl()}/resources/upload-media?category=${category}`,
      filePath,
      name: 'fileContents',
      formData: { category },
      header: getUploadAuthHeader(),
      success: (res) => {
        try {
          const body = JSON.parse(res.data)
          const data = body.data ?? body
          const list = Array.isArray(data) ? data : [data]
          resolve((list[0] as { url?: string })?.url || '')
        }
        catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail: err => reject(err),
    })
  })
}

/** 上传封面（需登录） */
export function uploadCover(filePath: string) {
  return uploadMedia(filePath, 'cover')
}

/** 上传头像（需登录） */
export function uploadAvatar(filePath: string) {
  return uploadMedia(filePath, 'avatar')
}

/** 上传正文图片（小程序/App 临时路径） */
export function uploadArticleImage(filePath: string) {
  return uploadMedia(filePath, 'article')
}

/**
 * H5：md-editor 传入 File 对象上传正文图片
 * @returns 原始 upload 响应（由 article.uploadArticleImage 解析为完整 URL）
 */
export async function uploadArticleImageFromFile(file: File): Promise<unknown> {
  const formData = new FormData()
  formData.append('fileContents', file)
  formData.append('category', 'article')
  const res = await fetch(`${getEnvBaseUrl()}/resources/upload-media?category=article`, {
    method: 'POST',
    headers: getUploadAuthHeader(),
    body: formData,
  })
  if (!res.ok)
    throw new Error('图片上传失败')
  const body = await res.json()
  if (body.code !== 0 && body.code !== 200)
    throw new Error(body.msg || body.message || '图片上传失败')
  return body.data ?? body
}

/** 更新用户资料 PATCH /user/edit */
export function updateUserProfile(data: {
  id: number
  nickname: string
  intro?: string
  homepage?: string
  avatar?: string
}) {
  return http.patch<void>('/user/edit', data)
}

/** 注册页可选头像 GET /resources/register-avatars */
export function getRegisterAvatars() {
  return http.get<{ avatars: string[] }>('/resources/register-avatars')
}

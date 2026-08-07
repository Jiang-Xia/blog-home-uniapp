/**
 * 工具箱 — 大文件分片上传 API（对齐 blog-home-nuxt/api/tool.ts）
 */
import { http } from '@/http/http'
import { getEnvBaseUrl } from '@/utils'

export interface CheckFileResult {
  isExist?: boolean
  chunks?: number[]
}

export interface MergeFilePayload {
  chunks: number
  fileName: string
  hash: string
}

/** 上传单个分片 */
export function uploadFileChunk(formData: {
  hash: string
  index: number
  fileName: string
  file: Blob | File | string
}): Promise<unknown> {
  const base = getEnvBaseUrl()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${base}/file/uploadBigFile?hash=${formData.hash}&index=${formData.index}`,
      filePath: typeof formData.file === 'string' ? formData.file : undefined,
      name: 'file',
      formData: {
        hash: formData.hash,
        index: String(formData.index),
        fileName: formData.fileName,
      },
      // #ifdef H5
      files: typeof formData.file !== 'string'
        ? [{ name: 'file', file: formData.file as File }]
        : undefined,
      // #endif
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300)
          resolve(res.data)
        else
          reject(new Error(res.data || 'upload failed'))
      },
      fail: reject,
    })
  })
}

/** 检查文件是否已存在 / 已上传分片 */
export function checkFile(params: { hash: string }) {
  return http<CheckFileResult>({
    url: '/file/uploadBigFile/checkFile',
    method: 'GET',
    query: params,
  })
}

/** 合并分片 */
export function mergeFile(data: MergeFilePayload) {
  return http<unknown>({
    url: '/file/uploadBigFile/merge',
    method: 'POST',
    data,
  })
}

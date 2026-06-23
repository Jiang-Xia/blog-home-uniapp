import { getEnvBaseUrl } from '@/utils'

export const SiteTitle = '江夏的Blog'

/** 工具箱数量（对齐 nuxt TOOL_LINKS） */
export const TOOL_COUNT = 14

const GUSHICI_FALLBACK = {
  content: '黄河远上白云间，一片孤城万仞山。',
  author: '王之涣',
  origin: '凉州词二首·其一',
}

export interface GushiciData {
  content?: string
  author?: string
  origin?: string
}

/** 每日古诗词 — 对齐 blog-home-nuxt api/index gushici */
export async function gushici(): Promise<GushiciData> {
  const origin = getEnvBaseUrl().replace(/\/api\/v1\/?$/, '')
  const urls = import.meta.env.DEV
    ? [`${origin}/x-zone/api/v1/third/gushici`, 'https://jiang-xia.top/x-zone/api/v1/third/gushici']
    : [`${origin}/x-zone/api/v1/third/gushici`]

  for (const url of urls) {
    try {
      const res = await new Promise<{ data?: GushiciData | { data?: GushiciData } }>((resolve, reject) => {
        uni.request({
          url,
          method: 'GET',
          success: resolve,
          fail: reject,
        })
      })
      const raw = res.data as any
      const data = raw?.data ?? raw
      if (data?.content?.trim())
        return data
    }
    catch {
      /* 尝试下一个 endpoint */
    }
  }

  return GUSHICI_FALLBACK
}

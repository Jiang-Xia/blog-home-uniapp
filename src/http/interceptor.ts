import type { CustomRequestOptions } from '@/http/types'
import { useTokenStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'
import { getPersistedAccessToken } from '@/utils/auth-token'
import { stringifyQuery } from './tools/queryString'

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 如果您使用了alova，则请把下面的代码放开注释
    // alova 执行流程：alova beforeRequest --> 本拦截器 --> alova responded
    // return options

    // 非 alova 请求，正常执行
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = stringifyQuery(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      }
      else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      // 仅本地 dev 经 Vite 代理；生产 H5 直连 VITE_SERVER_BASEURL（避免线上误拼 /fg-api）
      if (import.meta.env.DEV && JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE)) {
        // zone-server 走 /x-zone 代理；blog-server 走 /fg-api 代理（避免 localhost 直连线上 CORS）
        if (!options.url.startsWith('/x-zone/')) {
          options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
        }
      }
      else {
        options.url = baseUrl + options.url
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = 60000 // 60s
    // 2. 默认 header；带 body 的写请求显式 JSON，避免小程序按 form 编码导致 Hertz/Nest Bind 失败
    options.header = {
      ...options.header,
    }
    const method = String(options.method || 'GET').toUpperCase()
    const hasBody = options.data !== undefined && options.data !== null
    if (hasBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const headers = options.header as Record<string, string>
      const contentTypeKey = Object.keys(headers).find(k => k.toLowerCase() === 'content-type')
      if (!contentTypeKey)
        headers['Content-Type'] = 'application/json;charset=UTF-8'
    }
    // 3. 添加 token 请求头（Pinia + 本地 storage 双通道，避免登录后立即请求丢 token）
    const tokenStore = useTokenStore()
    const token = tokenStore.updateNowTime().validToken || getPersistedAccessToken()

    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }
    return options
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}

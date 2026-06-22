import { getEnvBaseUrl } from '@/utils'
import { getWsOrigin } from '@/utils/ws-origin'

/** Nuxt 前台 origin（Web 演示、404 动图等） */
export function getNuxtHomeUrl() {
  return import.meta.env.VITE_NUXT_HOME_URL || 'http://localhost:5050'
}

/** Admin 后台 origin */
export function getAdminUrl() {
  return (import.meta.env.VITE_ADMIN_URL || 'http://localhost:9856').replace(/\/$/, '')
}

/** 404 页动图（与 blog-home-nuxt config 同源路径） */
export function get404GifUrl() {
  return `${getWsOrigin()}/static/uploads/2022-09-12/hoyusqf2d051wy59rhmr26-404.gif`
}

/** 项目展示：Zone 多端扫码图（静态资源 URL） */
export const zoneDemoCards = [
  {
    title: 'APP',
    desc: '扫码下载安装即可体验 App',
    image: `${getEnvBaseUrl()}/static/uploads/2025-11/2e5d10df027b4cf28545b44901f7e8a4-app-code.png`,
  },
  {
    title: 'H5 页面',
    desc: '扫码即可体验 H5 页面',
    image: `${getEnvBaseUrl()}/static/uploads/2025-11/ea68358e78fd433fb5d2123e2cc0763b-h5.png`,
  },
  {
    title: '微信小程序',
    desc: '微信扫码体验小程序',
    image: `${getEnvBaseUrl()}/static/uploads/2025-11/1d6c3ffe42c3498a820965d9a46e0e2b-mini-program-code.jpg`,
  },
  {
    title: '支付宝小程序',
    desc: '支付宝扫码体验小程序',
    image: `${getEnvBaseUrl()}/static/uploads/2025-11/68a238667168490ea59c417e7f438b4b-circle_blue_slogan_50cm.png`,
  },
] as const

/** 项目演示链接（H5 浏览器打开；小程序/App 复制链接） */
export function getProjectLinks() {
  const admin = getAdminUrl()
  const nuxt = getNuxtHomeUrl().replace(/\/$/, '')
  return [
    { title: 'Zone', desc: '多端 Zone 演示', url: `${nuxt}/zone/#/` },
    { title: 'Blog Admin', desc: '博客管理后台', url: admin },
    { title: 'Data Screen', desc: '数据大屏', url: `${admin}/datascreen` },
    { title: 'Zone Admin', desc: 'Zone 管理端', url: `${admin}/admin/zone-admin/login` },
  ] as const
}

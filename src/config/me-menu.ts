import { ROUTE_ARTICLE_EDIT, ROUTE_PROFILE } from '@/router/routes'
import type { AppIconName } from '@/config/app-icons'

/** 个人中心 Tab，与 profile 页 activeTab 一致 */
export type MeMenuTab = 'card' | 'article' | 'collect' | 'comment' | 'inbox' | 'dashboard'

export interface MeMenuItem {
  icon: AppIconName
  title: string
  desc: string
  /** 跳转个人中心指定 Tab */
  tab?: MeMenuTab
  /** 独立页面路由（如写文章） */
  route?: string
  requiresLogin?: boolean
}

export interface MeMenuSection {
  title: string
  items: MeMenuItem[]
}

/** 我的 Tab 功能菜单（由原个人中心六 Tab 拆出） */
export const meMenuSections: MeMenuSection[] = [
  {
    title: '账号与资料',
    items: [
      {
        icon: 'user',
        title: '编辑资料',
        desc: '头像、昵称与个人简介',
        tab: 'card',
        requiresLogin: true,
      },
    ],
  },
  {
    title: '内容与创作',
    items: [
      {
        icon: 'edit-pen',
        title: '写文章',
        desc: '发布与编辑技术文章',
        route: ROUTE_ARTICLE_EDIT,
        requiresLogin: true,
      },
      {
        icon: 'article',
        title: '我的文章',
        desc: '管理已发布内容',
        tab: 'article',
        requiresLogin: true,
      },
      {
        icon: 'star',
        title: '我的收藏',
        desc: '收藏的文章列表',
        tab: 'collect',
        requiresLogin: true,
      },
    ],
  },
  {
    title: '互动与数据',
    items: [
      {
        icon: 'comment',
        title: '我的评论',
        desc: '评论与回复记录',
        tab: 'comment',
        requiresLogin: true,
      },
      {
        icon: 'inbox',
        title: '收件箱',
        desc: '系统通知与文章评论',
        tab: 'inbox',
        requiresLogin: true,
      },
      {
        icon: 'dashboard',
        title: '数据看板',
        desc: '阅读、点赞与评论统计',
        tab: 'dashboard',
        requiresLogin: true,
      },
    ],
  },
]

/** 解析菜单项目标路由 */
export function resolveMeMenuRoute(item: MeMenuItem): string {
  if (item.route)
    return item.route
  if (item.tab)
    return `${ROUTE_PROFILE}?tab=${item.tab}`
  return ROUTE_PROFILE
}

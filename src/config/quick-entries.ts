import {
  ROUTE_ABOUT,
  ROUTE_ARCHIVES,
  ROUTE_FEATURES,
  ROUTE_LINKS,
  ROUTE_MSGBOARD,
  ROUTE_PROJECTS,
  ROUTE_RPG_FULL,
  ROUTE_RPG_GUIDE,
  ROUTE_TOOL_INDEX,
} from '@/router/routes'
import type { AppIconName } from '@/config/app-icons'

/** 发现页入口阶段：1=可跳转，4=即将上线 */
export type QuickEntryPhase = 1 | 2 | 4

export interface ExploreItem {
  icon: AppIconName
  title: string
  /** 副标题（网格格内短描述） */
  desc: string
  route: string
  phase: QuickEntryPhase
  /** 图标底色渐变 class（UnoCSS） */
  color: string
  /** 需登录后跳转 */
  requiresLogin?: boolean
}

export interface ExploreSection {
  icon: AppIconName
  title: string
  subtitle: string
  /** 分区头图渐变 */
  color: string
  items: ExploreItem[]
}

/**
 * 发现页分区入口（对齐参考图：分区大卡片 + 四列功能格）
 * - 个人中心功能已迁至「我的」Tab；此处保留站点浏览与社区入口
 */
export const exploreSections: ExploreSection[] = [
  {
    icon: 'archive',
    title: '博客阅读',
    subtitle: '归档浏览与能力一览',
    color: 'from-blue-500 to-cyan-500',
    items: [
      {
        icon: 'archive',
        title: '文章归档',
        desc: '按时间浏览',
        route: ROUTE_ARCHIVES,
        phase: 1,
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: 'sparkle',
        title: '系统特性',
        desc: '能力总览',
        route: ROUTE_FEATURES,
        phase: 1,
        color: 'from-fuchsia-500 to-violet-500',
      },
      {
        icon: 'info',
        title: '关于作者',
        desc: '站点与作者',
        route: ROUTE_ABOUT,
        phase: 1,
        color: 'from-slate-500 to-gray-500',
      },
    ],
  },
  {
    icon: 'sword',
    title: 'RPG 冒险',
    subtitle: '签到任务与玩法奖励',
    color: 'from-amber-500 to-orange-500',
    items: [
      {
        icon: 'sword',
        title: '冒险中心',
        desc: '签到抽奖',
        route: ROUTE_RPG_FULL,
        phase: 1,
        color: 'from-amber-500 to-orange-500',
        requiresLogin: true,
      },
      {
        icon: 'book',
        title: '玩法说明',
        desc: '规则指南',
        route: ROUTE_RPG_GUIDE,
        phase: 1,
        color: 'from-violet-500 to-purple-500',
      },
    ],
  },
  {
    icon: 'comment',
    title: '社区互动',
    subtitle: '友链申请与留言交流',
    color: 'from-emerald-500 to-teal-500',
    items: [
      {
        icon: 'comment',
        title: '留言板',
        desc: '互动交流',
        route: ROUTE_MSGBOARD,
        phase: 1,
        color: 'from-emerald-500 to-teal-500',
      },
      {
        icon: 'link',
        title: '友情链接',
        desc: '发现站点',
        route: ROUTE_LINKS,
        phase: 1,
        color: 'from-indigo-500 to-blue-500',
      },
    ],
  },
  {
    icon: 'tools',
    title: '实用工具',
    subtitle: '加密编码与效率工具',
    color: 'from-purple-500 to-pink-500',
    items: [
      {
        icon: 'tools',
        title: '工具箱',
        desc: '全部工具',
        route: ROUTE_TOOL_INDEX,
        phase: 1,
        color: 'from-purple-500 to-pink-500',
      },
      {
        icon: 'lock',
        title: '条形/二维码',
        desc: '条码与二维码',
        route: '/pages-tool/codes/index',
        phase: 1,
        color: 'from-violet-500 to-purple-500',
      },
      {
        icon: 'key',
        title: 'RSA',
        desc: '非对称加密',
        route: '/pages-tool/rsa/index',
        phase: 1,
        color: 'from-blue-500 to-indigo-500',
      },
      {
        icon: 'robot',
        title: 'AI 摘要',
        desc: '长文摘要',
        route: '/pages-tool/ai-summary/index',
        phase: 1,
        color: 'from-cyan-500 to-blue-500',
      },
    ],
  },
  {
    icon: 'package',
    title: '项目介绍',
    subtitle: '开源合作与多端展示',
    color: 'from-cyan-500 to-blue-500',
    items: [
      {
        icon: 'package',
        title: '开源合作',
        desc: '三端说明',
        route: '/pages-blog/open-source/index',
        phase: 1,
        color: 'from-emerald-500 to-teal-500',
      },
      {
        icon: 'dashboard',
        title: '项目展示',
        desc: 'Demo 体验',
        route: ROUTE_PROJECTS,
        phase: 1,
        color: 'from-cyan-500 to-blue-500',
      },
    ],
  },
]

/** @deprecated 使用 exploreSections；保留扁平列表供脚本/兼容引用 */
export type QuickEntry = ExploreItem & { tags?: string[] }

export const quickEntries: QuickEntry[] = exploreSections.flatMap(section =>
  section.items.map(item => ({ ...item, tags: [] })),
)

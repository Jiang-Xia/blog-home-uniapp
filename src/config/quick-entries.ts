import {
  ROUTE_ARCHIVES,
  ROUTE_FEATURES,
  ROUTE_LINKS,
  ROUTE_MSGBOARD,
  ROUTE_PROFILE,
  ROUTE_PROJECTS,
  ROUTE_RPG_FULL,
  ROUTE_RPG_GUIDE,
} from '@/router/routes'

/** 发现页卡片阶段：1=可跳转，4=即将上线 */
export type QuickEntryPhase = 1 | 2 | 4

export interface QuickEntry {
  icon: string
  title: string
  desc: string
  tags: string[]
  route: string
  phase: QuickEntryPhase
  /** 图标背景渐变 class */
  color: string
}

/** 对齐 blog-home-nuxt explore 卡片，route 为 uniapp 路径 */
export const quickEntries: QuickEntry[] = [
  {
    icon: '📚',
    title: '文章归档',
    desc: '按时间浏览全部文章，支持分类标签与全文检索。',
    tags: ['归档', '标签', '浏览'],
    route: ROUTE_ARCHIVES,
    phase: 1,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '⚔️',
    title: 'RPG 冒险',
    desc: '签到升级、任务奖励、抽奖开宝箱，解锁称号与头像框。',
    tags: ['签到', '任务', '抽奖'],
    route: ROUTE_RPG_FULL,
    phase: 1,
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: '📖',
    title: '玩法说明',
    desc: 'RPG 系统规则、经验获取与等级奖励一览。',
    tags: ['指南', '规则'],
    route: ROUTE_RPG_GUIDE,
    phase: 1,
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: '👤',
    title: '个人中心',
    desc: '我的文章、收藏、评论与数据看板。',
    tags: ['用户', '看板'],
    route: ROUTE_PROFILE,
    phase: 1,
    color: 'from-sky-500 to-blue-500',
  },
  {
    icon: '💬',
    title: '留言板',
    desc: '访客留言，与作者互动交流。',
    tags: ['社区', '留言'],
    route: ROUTE_MSGBOARD,
    phase: 1,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🔗',
    title: '友情链接',
    desc: '发现更多优质博客与开发者站点。',
    tags: ['友链', '推荐'],
    route: ROUTE_LINKS,
    phase: 1,
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: '🛠️',
    title: '工具箱',
    desc: '加密解密、编码转换等实用工具。',
    tags: ['加密', '工具'],
    route: '/pages-tool/index/index',
    phase: 1,
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '📦',
    title: '开源与合作',
    desc: '三端项目说明、后端闭源政策与付费技术咨询入口。',
    tags: ['三端', '开源', '合作'],
    route: '/pages-blog/open-source/index',
    phase: 1,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '📊',
    title: '项目展示',
    desc: 'Blog Admin、Zone 等多端演示与扫码体验。',
    tags: ['Demo', '多端'],
    route: ROUTE_PROJECTS,
    phase: 1,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '✨',
    title: '系统特性',
    desc: '博客核心能力、RPG 玩法与工具箱一览。',
    tags: ['特性', '指南'],
    route: ROUTE_FEATURES,
    phase: 1,
    color: 'from-fuchsia-500 to-violet-500',
  },
]

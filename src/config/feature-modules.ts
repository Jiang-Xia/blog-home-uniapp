import {
  ROUTE_ARCHIVES,
  ROUTE_HOME,
  ROUTE_MSGBOARD,
  ROUTE_PROFILE,
  ROUTE_PROJECTS,
  ROUTE_RPG_FULL,
  ROUTE_TOOL_INDEX,
} from '@/router/routes'

export interface FeatureModule {
  icon: string
  title: string
  desc: string
  tags: string[]
  route: string
}

/** 博客特性页模块数据（路由为 uniapp 路径） */
export const rpgFeatureModule: FeatureModule = {
  icon: '⚔️',
  title: 'RPG 冒险体系',
  desc: '签到升级、成就任务、背包装扮、抽奖 Buff、钻石经济、公会赛季与排行榜——博客即冒险世界。',
  tags: ['签到', '任务', '抽奖', '钻石', '公会', '排行榜'],
  route: ROUTE_RPG_FULL,
}

export const coreFeatureModules: FeatureModule[] = [
  {
    icon: '📝',
    title: '文章系统',
    desc: 'Markdown 编辑与预览、分类标签、全文检索、按时间归档，支持用户前台创作与管理。',
    tags: ['Markdown', '归档', '标签'],
    route: ROUTE_ARCHIVES,
  },
  {
    icon: '💬',
    title: '评论与互动',
    desc: '文章评论与回复、收藏点赞（需登录），互动数据驱动 RPG 经验与文章成长。',
    tags: ['评论', '收藏', '点赞'],
    route: ROUTE_HOME,
  },
  {
    icon: '👤',
    title: '用户中心',
    desc: '个人资料编辑、前台文章创作、公开主页展示 RPG 状态与互动记录。',
    tags: ['注册登录', '个人主页', '发文'],
    route: ROUTE_PROFILE,
  },
  {
    icon: '🔗',
    title: '友链与留言',
    desc: '友情链接申请与展示、树形留言板，支持回复与 RPG 经验联动。',
    tags: ['友链', '留言板'],
    route: ROUTE_MSGBOARD,
  },
  {
    icon: '📊',
    title: '项目展示',
    desc: '嵌入 Blog Admin、Zone 等多端演示，扫码体验 App / H5 / 小程序。',
    tags: ['Demo', '多端'],
    route: ROUTE_PROJECTS,
  },
]

export const experienceFeatureModules: FeatureModule[] = [
  {
    icon: '🤖',
    title: 'AI 文章摘要',
    desc: '多风格、多长度 AI 摘要生成，支持历史记录与 Markdown 导出。',
    tags: ['AI', 'DeepSeek'],
    route: '/pages-tool/ai-summary/index',
  },
  {
    icon: '📖',
    title: '阅读进度与目录',
    desc: '文章详情目录跳转、代码高亮与封面预览。',
    tags: ['阅读体验'],
    route: ROUTE_HOME,
  },
  {
    icon: '📡',
    title: '实时推送',
    desc: 'Socket.IO /realtime 命名空间，升级、成就、禁言、站内通知等即时推送。',
    tags: ['WebSocket'],
    route: ROUTE_RPG_FULL,
  },
  {
    icon: '🛠️',
    title: '实用工具箱',
    desc: '加密、编码、二维码、水印等效率工具，H5 端能力最全。',
    tags: ['工具'],
    route: ROUTE_TOOL_INDEX,
  },
]

export const toolFeatureLinks = [
  { title: '编码转换', route: '/pages-tool/codes/index' },
  { title: 'RSA 加解密', route: '/pages-tool/rsa/index' },
  { title: '对称加密', route: '/pages-tool/crypto/index' },
  { title: '国密 SM2', route: '/pages-tool/sm/index' },
  { title: '二维码', route: '/pages-tool/qrcode/index' },
  { title: 'AI 摘要', route: '/pages-tool/ai-summary/index' },
  { title: '批量水印', route: '/pages-tool/watermark/index' },
  { title: 'PDF 预览', route: '/pages-tool/pdf/index' },
] as const

export const getStartedSteps = [
  { title: '浏览与阅读', desc: '首页发现文章，归档按时间浏览，详情页收藏点赞。' },
  { title: '注册参与 RPG', desc: '登录后进入冒险中心签到、做任务，解锁装扮与成就。' },
  { title: '创作与工具', desc: '个人中心发文，工具箱使用 AI 摘要、加密等效率工具。' },
] as const

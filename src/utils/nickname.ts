/** 访客留言/注册随机昵称（对齐 blog-home-nuxt DEFAULT_NICKNAMES 子集） */
const DEFAULT_NICKNAMES = [
  '冒险萌新',
  '码字酱',
  '阅读酱',
  '点赞酱',
  '评论酱',
  '摸鱼酱',
  '元气酱',
  '幸运酱',
] as const

/** 随机取一个访客昵称 */
export function getRandomNickname(list: readonly string[] = DEFAULT_NICKNAMES): string {
  if (!list.length)
    return '冒险萌新'
  return list[Math.floor(Math.random() * list.length)]!
}

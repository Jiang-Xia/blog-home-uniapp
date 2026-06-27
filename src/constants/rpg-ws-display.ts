export const SOCIAL_ACTION_LABEL: Record<string, string> = {
  cheer: '加油',
  egg: '扔鸡蛋',
  flower: '送鲜花',
}

export const EXP_REASON_LABEL: Record<string, string> = {
  sign_in: '签到',
  comment: '评论',
  msgboard: '留言',
  reply: '回复',
  article: '发文',
  like: '点赞',
  collect: '收藏',
  quest: '任务',
  achievement: '成就',
  lottery: '抽奖',
}

export const LEADERBOARD_PERIOD_LABEL: Record<string, string> = {
  week: '周榜',
  month: '月榜',
  season: '赛季榜',
  total: '总榜',
}

export const LEADERBOARD_TYPE_LABEL: Record<string, string> = {
  exp: '经验榜',
  reputation: '声望榜',
  currency: '钻石榜',
  level: '等级榜',
  signDays: '签到榜',
}

export function getRankMedalEmoji(rank: number): string {
  if (rank === 1)
    return '🥇'
  if (rank === 2)
    return '🥈'
  if (rank === 3)
    return '🥉'
  return '🏅'
}

export function formatGuildEventMessage(
  type: 'memberJoined' | 'memberLeft' | 'guildCreated',
  nickname: string,
  guildName: string,
): string {
  switch (type) {
    case 'memberJoined':
      return `👥 ${nickname} 加入了公会「${guildName}」`
    case 'memberLeft':
      return `👋 ${nickname} 退出了公会「${guildName}」`
    case 'guildCreated':
      return `🏰 公会「${guildName}」已创建`
    default:
      return `公会「${guildName}」有变动`
  }
}

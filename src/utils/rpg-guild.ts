/**
 * 公会 API 响应归一化（兼容 Nest 扁平结构与 Go { guild, members } 结构）
 */
import { getPublicUser } from '@/api/profile'

export interface GuildMemberView {
  uid: number
  role?: string
  nickname?: string
  username?: string
  avatar?: string
  joinTime?: string
}

export interface MyGuildView {
  id: number
  name: string
  leaderUid?: number
  memberCount?: number
  announcement?: string
  members?: GuildMemberView[]
  myRole?: string
}

/** 将 GET /rpg/guild/my 响应转为 GuildPanel 期望的扁平结构；未加入公会时返回 null */
export function normalizeMyGuild(raw: unknown): MyGuildView | null {
  if (!raw || typeof raw !== 'object')
    return null

  const data = raw as Record<string, unknown>

  // Go 单体：{ guild: {...}|null, members: [...], myRole }
  if ('guild' in data) {
    const guild = data.guild as Record<string, unknown> | null
    if (!guild)
      return null
    const members = (data.members as GuildMemberView[] | undefined) ?? []
    return {
      ...(guild as MyGuildView),
      members,
      myRole: data.myRole as string | undefined,
      memberCount: (guild.memberCount as number | undefined) ?? members.length,
    }
  }

  // Nest：扁平 guild 对象或 null
  if (!data.id && !data.name)
    return null

  const members = (data.members as GuildMemberView[] | undefined) ?? []
  return {
    ...(data as MyGuildView),
    members,
    memberCount: (data.memberCount as number | undefined) ?? members.length,
  }
}

/** 为缺少 nickname/avatar 的成员批量拉取公开主页信息（Go 后端成员列表不含用户字段） */
export async function enrichGuildMembers(guild: MyGuildView | null): Promise<MyGuildView | null> {
  if (!guild?.members?.length)
    return guild

  const needsEnrich = guild.members.some(m => !m.nickname && !m.avatar)
  if (!needsEnrich)
    return guild

  const members = await Promise.all(
    guild.members.map(async (member) => {
      if (member.nickname || member.avatar)
        return member
      try {
        const user = await getPublicUser(member.uid)
        return {
          ...member,
          nickname: user?.nickname || user?.username || `用户${member.uid}`,
          username: user?.username || member.username,
          avatar: user?.avatar || '',
        }
      }
      catch {
        return {
          ...member,
          nickname: member.nickname || `用户${member.uid}`,
        }
      }
    }),
  )

  return { ...guild, members }
}

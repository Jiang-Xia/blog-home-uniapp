import type { IUserInfoRes } from '@/api/types/login'

/** 将 server /user/info 响应映射为 Pinia user store 结构 */
export function mapServerUser(data: Record<string, unknown>): IUserInfoRes {
  const roles = data.roles as { name?: string }[] | undefined
  const roleName = roles?.[0]?.name ?? (data.role as string | undefined)
  return {
    userId: Number(data.id ?? data.userId ?? -1),
    username: String(data.username ?? ''),
    nickname: String(data.nickname ?? ''),
    avatar: (data.avatar as string) || undefined,
    homepage: data.homepage as string | undefined,
    intro: data.intro as string | undefined,
    uid: Number(data.id ?? data.uid ?? -1),
    role: roleName,
    roles: roles?.map(r => r.name).filter(Boolean) as string[] | undefined,
  }
}

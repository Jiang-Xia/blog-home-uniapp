import { http } from '@/http/http'

/** 友链项（对齐 blog-server Link 实体） */
export interface LinkItem {
  id: string
  icon: string
  url: string
  title: string
  desp: string
  agreed?: boolean
}

export function getLinks() {
  return http.get<LinkItem[]>('/link', { client: true })
}

export function createLink(data: { title: string, url: string, desp?: string, icon?: string }) {
  return http.post<LinkItem>('/link', data)
}

/** 删除友链 DELETE /link?id=（对齐 Nest/Go） */
export function deleteLink(id: number | string) {
  return http.delete<void>('/link', { id: String(id) })
}

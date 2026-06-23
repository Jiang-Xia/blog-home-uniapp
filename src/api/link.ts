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

export function deleteLink(id: number) {
  return http.post<void>('/link/delete', { id })
}

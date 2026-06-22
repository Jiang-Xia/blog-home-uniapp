import { http } from '@/http/http'

export function getLinks() {
  return http.get<any[]>('/link')
}

export function createLink(data: { name: string, url: string, description?: string, avatar?: string }) {
  return http.post<any>('/link', data)
}

export function deleteLink(id: number) {
  return http.post<void>('/link/delete', { id })
}

import { http } from '@/http/http'

export function getTagById(id: number | string) {
  return http.get<any>(`/tag/${id}`)
}

export function getAllTag() {
  return http.get<any[]>('/tag', { isDelete: true })
}

export function getTagArticles(id: number | string, params?: { page?: number, pageSize?: number }) {
  return http.get<any>(`/tag/${id}/article`, params)
}

import { http } from '@/http/http'

export function getCategoryById(id: number | string) {
  return http.get<any>(`/category/${id}`)
}

export function getAllCategory() {
  return http.get<any[]>('/category', { isDelete: true })
}

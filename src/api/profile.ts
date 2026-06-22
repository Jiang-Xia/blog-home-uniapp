import { http } from '@/http/http'

export function getPublicUser(uid: string | number) {
  return http.get<any>(`/user/public/${uid}`)
}

export function getPublicUserArticles(uid: string | number, params?: { page?: number, pageSize?: number }) {
  return http.get<any>(`/user/public/${uid}/articles`, params)
}

export function getPublicUserCollects(uid: string | number, params?: { page?: number, pageSize?: number }) {
  return http.get<any>(`/user/public/${uid}/collects`, params)
}

export function getPublicUserLikes(uid: string | number, params?: { page?: number, pageSize?: number }) {
  return http.get<any>(`/user/public/${uid}/likes`, params)
}

export function getPublicRpgStatusBatch(uids: number[]) {
  return http.get<any>('/rpg/public/status/batch', { uids: uids.join(',') })
}

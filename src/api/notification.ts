import { http } from '@/http/http'

export function getNotificationList(params?: { page?: number, pageSize?: number, read?: boolean }) {
  return http.get<any>('/notification/list', params)
}

export function getUnreadCount() {
  return http.get<{ count: number }>('/notification/unread-count')
}

export function markNotificationRead(ids: number[]) {
  return http.patch<void>('/notification/read', { ids })
}

export function markAllNotificationsRead() {
  return http.patch<void>('/notification/read-all')
}

/** 断线补漏：拉 seq 之后错过的站内通知并回放 */
export function getNotificationsSince(seq: number) {
  return http.get<{
    id: number
    type: string
    payload: Record<string, unknown>
    read: number
    createTime: string
  }[]>('/notification/since', { seq })
}

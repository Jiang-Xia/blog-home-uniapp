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

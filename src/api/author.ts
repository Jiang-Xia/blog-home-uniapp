import type { ArticleItem } from '@/api/article'
import { http } from '@/http/http'

export function getAuthorStats() {
  return http.get<any>('/article/author-stats')
}

export function getRelatedArticles(id: string | number, limit = 6) {
  return http.get<{ list: ArticleItem[] }>('/article/related', { id, limit })
}

export function getCommentsOnMyArticles(params?: { page?: number, pageSize?: number }) {
  return http.get<any>('/comment/on-my-articles', params)
}

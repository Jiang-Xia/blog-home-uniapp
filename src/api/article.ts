/**
 * 文章相关 API（对齐 blog-home-nuxt/api/article.ts）
 * - 列表/详情/互动/评论/写作
 */
import { http } from '@/http/http'
import { filterApprovedComments } from '@/utils/comment'
import type { ArticleDetailResponse } from '@/utils/article-detail'
import { parseUploadedUrl } from '@/utils/static-url'
import { uploadArticleImageFromFile } from '@/api/resources'

export type { ArticleDetailResponse } from '@/utils/article-detail'
export { parseArticleDetail } from '@/utils/article-detail'

export interface ArticleListParams {
  page?: number
  pageSize?: number
  sort?: 'ASC' | 'DESC'
  category?: string
  tags?: string[]
  title?: string
  description?: string
  content?: string
  client?: boolean
}

export interface ArticleItem {
  id: number
  title: string
  description?: string
  cover?: string
  createTime?: string
  tags?: { id: number, name?: string, label?: string }[]
  category?: { id: number, name?: string, label?: string }
  views?: number
  likes?: number
  commentCount?: number
}

export function getArticleList(data: ArticleListParams) {
  return http.post<{ list: ArticleItem[], pagination?: { total: number, page: number, pageSize: number } }>('/article/list', data)
}

export function getArticleInfo(params: { id?: string | number }) {
  if (!params.id)
    return Promise.resolve(null)
  return http.get<ArticleDetailResponse | Record<string, unknown>>('/article/info', params, undefined, { hideErrorToast: true }).catch(() => null)
}

export function getArchives() {
  return http.get<any[]>('/article/archives')
}

export function postArticleViews(id: string | number) {
  return http.post<void>('/article/views', { id })
}

export function getComment(articleId: string, params?: { page?: number, pageSize?: number }) {
  return http.get<any>('/comment/findAll', { articleId, ...params }).then((res) => {
    if (res?.list)
      res.list = filterApprovedComments(res.list)
    return res
  })
}

/** 发表评论 POST /comment/create；返回含 status（pending 时不刷新列表） */
export function addComment(data: { articleId: string | number, content: string, uid?: number }) {
  return http.post<any>('/comment/create', data)
}

/** 删除评论 DELETE /comment/delete */
export function delComment(id: string | number) {
  return http.delete<void>('/comment/delete', { id: String(id) })
}

/** 发表回复 POST /reply/create；返回含 status */
export function addReply(data: {
  parentId: string | number
  uid?: number
  content: string
  replyUid: string | number
}) {
  return http.post<any>('/reply/create', {
    ...data,
    parentId: String(data.parentId),
    replyUid: String(data.replyUid),
  })
}

/** 删除回复 DELETE /reply/delete */
export function delReply(id: string | number) {
  return http.delete<void>('/reply/delete', { id: String(id) })
}

/** H5 Markdown 编辑器图片上传，返回可插入的完整 URL */
export async function uploadArticleImage(file: File) {
  const res = await uploadArticleImageFromFile(file)
  return parseUploadedUrl(res)
}

export function toggleLike(articleId: string | number) {
  return http.post<any>('/like', { articleId: String(articleId) })
}

export function checkLiked(articleId: string | number) {
  return http.get<{ liked: boolean }>('/like/check', { articleId: String(articleId) })
}

export function toggleCollect(articleId: string | number) {
  return http.post<any>('/collect', { articleId: String(articleId) })
}

export function checkCollected(articleId: string | number) {
  return http.get<{ collected: boolean }>('/collect/check', { articleId: String(articleId) })
}

export function getMyArticleList(params: { page?: number, pageSize?: number }) {
  return http.get<any>('/article/my-list', params)
}

export function getMyCollectList(params: { page?: number, pageSize?: number }) {
  return http.get<any>('/collect/list', params)
}

export function getMyComments(params: { page?: number, pageSize?: number }) {
  return http.get<any>('/comment/my-list', params)
}

export function getRelatedArticles(id: string | number, limit = 6) {
  return http.get<{ list: ArticleItem[] }>('/article/related', { id, limit })
}

export function createArticle(data: Record<string, unknown>) {
  return http.post<{ id?: number, info?: { id: number } }>('/article/create', data)
}

export function editArticle(data: Record<string, unknown>) {
  return http.post<void>('/article/edit', data)
}

export function disableArticle(id: number | string, isDelete = true) {
  return http.patch<void>('/article/disabled', { id, isDelete })
}

export function getMyReplies(params: { page?: number, pageSize?: number }) {
  return http.get<any>('/reply/my-list', params)
}

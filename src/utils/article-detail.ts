/**
 * 文章详情响应解包（对齐 blog-home-nuxt GET /article/info）
 */
export interface ArticleDetailNavItem {
  id: number
  title: string
}

export interface ArticleDetailResponse {
  info?: Record<string, unknown>
  prev?: ArticleDetailNavItem | null
  next?: ArticleDetailNavItem | null
}

/** 解包 /article/info 响应（兼容 info 包装与扁平结构） */
export function parseArticleDetail(data: ArticleDetailResponse | Record<string, unknown> | null) {
  if (!data)
    return { info: null, prev: null, next: null }

  const wrapped = data as ArticleDetailResponse
  if (wrapped.info && typeof wrapped.info === 'object') {
    return {
      info: wrapped.info as Record<string, unknown>,
      prev: wrapped.prev ?? null,
      next: wrapped.next ?? null,
    }
  }

  const flat = data as Record<string, unknown>
  const { prev, next, ...rest } = flat
  const hasArticleFields = 'title' in rest || 'content' in rest || 'id' in rest
  if (hasArticleFields) {
    return {
      info: rest,
      prev: (prev as ArticleDetailResponse['prev']) ?? null,
      next: (next as ArticleDetailResponse['next']) ?? null,
    }
  }

  return { info: flat, prev: null, next: null }
}

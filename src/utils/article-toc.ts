/**
 * 文章目录项（来自 md-editor MdPreview @on-get-catalog）
 */
export interface ArticleTocItem {
  level: string
  id: string
  text: string
}

/** 详情页 scroll-view 选择器（与 detail.vue 一致） */
export const ARTICLE_TOC_SCROLL_SELECTOR = '#detail-scroll'

/** MdPreview / mp-html 正文容器，限定标题查找范围 */
export const ARTICLE_TOC_CONTENT_SELECTOR = '.article-md-content'

/** 点击目录 / scroll spy 时预留的顶部偏移（px） */
export const ARTICLE_TOC_SCROLL_OFFSET = 12

/** 与 MdPreview mdHeadingId 一致，避免重复标题导致 TOC 多选 */
export function mdHeadingId({ index }: { text?: string, level?: number, index: number }) {
  return `heading-${index}`
}

/** 将 md-editor catalog 转为 ArticleTocItem */
export function mapMdCatalog(list: Array<{ level?: number | string, text: string }>): ArticleTocItem[] {
  return list.map((v, i) => ({
    level: String(v.level ?? 1),
    id: mdHeadingId({ index: i + 1 }),
    text: v.text,
  }))
}

type TocQueryNode = UniApp.NodeInfo | { scrollTop?: number } | null

/**
 * 根据 createSelectorQuery 结果计算各标题在 scroll-view 内的 scrollTop
 */
export function buildTocHeadingOffsets(
  topics: ArticleTocItem[],
  queryResults: TocQueryNode[],
): Record<string, number> {
  const scrollRect = queryResults[0] as UniApp.NodeInfo | null
  const scrollOffset = queryResults[1] as { scrollTop?: number } | null
  if (!scrollRect)
    return {}

  const baseScrollTop = scrollOffset?.scrollTop ?? 0
  const scrollTopEdge = scrollRect.top ?? 0
  const offsets: Record<string, number> = {}

  topics.forEach((item, index) => {
    const rect = queryResults[2 + index] as UniApp.NodeInfo | null
    if (!rect)
      return
    offsets[item.id] = baseScrollTop + rect.top - scrollTopEdge
  })

  return offsets
}

/**
 * 按当前 scrollTop 计算应高亮的目录项（对齐 blog-home-nuxt Catalogue scroll spy）
 */
export function resolveActiveTocId(
  topics: ArticleTocItem[],
  scrollTop: number,
  offsets: Record<string, number>,
  scrollOffset = ARTICLE_TOC_SCROLL_OFFSET,
): string {
  if (!topics.length)
    return ''

  const scrollPos = scrollTop + scrollOffset + 8
  let currentId = topics[0].id

  for (const item of topics) {
    const top = offsets[item.id]
    if (top == null)
      continue
    if (top <= scrollPos)
      currentId = item.id
  }

  return currentId
}

/** 计算目录项对应的 scroll-view scrollTop */
export function calcTocTargetScrollTop(
  id: string,
  offsets: Record<string, number>,
  scrollOffset = ARTICLE_TOC_SCROLL_OFFSET,
): number | null {
  const top = offsets[id]
  if (top == null)
    return null
  return Math.max(0, top - scrollOffset)
}

/** 目录标题在 createSelectorQuery 中的选择器（小程序组件树须用 >>>） */
export function tocHeadingQuerySelector(id: string): string {
  const path = `${ARTICLE_TOC_SCROLL_SELECTOR} ${ARTICLE_TOC_CONTENT_SELECTOR}`
  return scrollSectionQuerySelector(path, id)
}

/** scroll-view 内锚点节的选择器（小程序组件树须用 >>>） */
export function scrollSectionQuerySelector(scrollSelector: string, id: string): string {
  // #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
  return `${scrollSelector} >>> #${id}`
  // #endif
  // #ifndef MP-WEIXIN || MP-QQ || MP-TOUTIAO
  return `${scrollSelector} #${id}`
  // #endif
}

/** scroll-view 内原生 view 锚点（章节外包 view，无自定义组件隔层；小程序勿用 >>>） */
export function nativeScrollSectionQuerySelector(scrollSelector: string, id: string): string {
  return `${scrollSelector} #${id}`
}

/**
 * 测量目录标题在详情 scroll-view 中的偏移
 * - 须在页面级调用（勿 .in 自定义组件），否则查不到 scroll-view 内节点
 */
export function measureTocHeadingOffsets(topics: ArticleTocItem[]): Promise<Record<string, number>> {
  return measureScrollSectionOffsets(ARTICLE_TOC_SCROLL_SELECTOR, topics, tocHeadingQuerySelector)
}

/**
 * 测量 scroll-view 内各锚点节的 scrollTop 偏移
 * - 须在页面级调用（勿 .in 自定义组件），否则查不到 scroll-view 内节点
 */
export function measureScrollSectionOffsets(
  scrollSelector: string,
  topics: ArticleTocItem[],
  sectionSelector: (id: string) => string = id => scrollSectionQuerySelector(scrollSelector, id),
): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    if (!topics.length) {
      resolve({})
      return
    }

    const query = uni.createSelectorQuery()
    query.select(scrollSelector).boundingClientRect()
    query.select(scrollSelector).scrollOffset()

    for (const item of topics) {
      query.select(sectionSelector(item.id)).boundingClientRect()
    }

    query.exec((res) => {
      resolve(buildTocHeadingOffsets(topics, res as TocQueryNode[]))
    })
  })
}

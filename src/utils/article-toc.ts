/**
 * 文章目录项（来自 md-editor MdPreview @on-get-catalog）
 */
export interface ArticleTocItem {
  level: string
  id: string
  text: string
}

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

import { describe, expect, it } from 'vitest'
import {
  buildTocHeadingOffsets,
  calcTocTargetScrollTop,
  mapMdCatalog,
  mdHeadingId,
  resolveActiveTocId,
} from './article-toc'
import type { ArticleTocItem } from './article-toc'

describe('article-toc', () => {
  it('mdHeadingId 使用序号避免重复标题冲突', () => {
    expect(mdHeadingId({ index: 1 })).toBe('heading-1')
  })

  it('mapMdCatalog 映射 level/id/text', () => {
    const items = mapMdCatalog([{ level: 2, text: '章节一' }])
    expect(items[0]).toEqual({ level: '2', id: 'heading-1', text: '章节一' })
  })

  it('buildTocHeadingOffsets 计算标题 scrollTop', () => {
    const topics: ArticleTocItem[] = [
      { level: '1', id: 'heading-1', text: '一' },
      { level: '2', id: 'heading-2', text: '二' },
    ]
    const offsets = buildTocHeadingOffsets(topics, [
      { top: 100, height: 600 },
      { scrollTop: 50 },
      { top: 180, height: 24 },
      { top: 260, height: 24 },
    ])
    expect(offsets['heading-1']).toBe(130)
    expect(offsets['heading-2']).toBe(210)
  })

  it('resolveActiveTocId 按 scrollTop 选中当前章节', () => {
    const topics: ArticleTocItem[] = [
      { level: '1', id: 'heading-1', text: '一' },
      { level: '2', id: 'heading-2', text: '二' },
    ]
    const offsets = { 'heading-1': 100, 'heading-2': 300 }
    expect(resolveActiveTocId(topics, 80, offsets, 12)).toBe('heading-1')
    expect(resolveActiveTocId(topics, 280, offsets, 12)).toBe('heading-2')
  })

  it('calcTocTargetScrollTop 扣除顶部偏移', () => {
    expect(calcTocTargetScrollTop('heading-2', { 'heading-2': 300 }, 12)).toBe(288)
    expect(calcTocTargetScrollTop('missing', {}, 12)).toBeNull()
  })
})

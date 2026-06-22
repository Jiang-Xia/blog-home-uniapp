import { describe, expect, it } from 'vitest'
import { mapMdCatalog, mdHeadingId } from './article-toc'

describe('article-toc', () => {
  it('mdHeadingId 使用序号避免重复标题冲突', () => {
    expect(mdHeadingId({ index: 1 })).toBe('heading-1')
  })

  it('mapMdCatalog 映射 level/id/text', () => {
    const items = mapMdCatalog([{ level: 2, text: '章节一' }])
    expect(items[0]).toEqual({ level: '2', id: 'heading-1', text: '章节一' })
  })
})

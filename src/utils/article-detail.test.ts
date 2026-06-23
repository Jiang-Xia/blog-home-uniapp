import { describe, expect, it } from 'vitest'
import { parseArticleDetail } from './article-detail'

describe('parseArticleDetail', () => {
  it('解包 info 包装结构并保留 prev/next', () => {
    const result = parseArticleDetail({
      info: { id: 1, title: '当前文' },
      prev: { id: 2, title: '上一篇' },
      next: { id: 3, title: '下一篇' },
    })
    expect(result.info).toEqual({ id: 1, title: '当前文' })
    expect(result.prev).toEqual({ id: 2, title: '上一篇' })
    expect(result.next).toEqual({ id: 3, title: '下一篇' })
  })

  it('兼容扁平结构中的 prev/next', () => {
    const result = parseArticleDetail({
      id: 10,
      title: '扁平文',
      prev: { id: 9, title: '前' },
      next: null,
    })
    expect(result.info).toMatchObject({ id: 10, title: '扁平文' })
    expect(result.prev).toEqual({ id: 9, title: '前' })
    expect(result.next).toBeNull()
  })

  it('空数据返回 null', () => {
    expect(parseArticleDetail(null)).toEqual({ info: null, prev: null, next: null })
  })
})

import { describe, expect, it } from 'vitest'
import { APPROVED_COMMENT_STATUS, filterApprovedComments, parseCommentCreateStatus } from './comment'

describe('filterApprovedComments', () => {
  it('保留 approved 与无 status 的历史数据', () => {
    const list = filterApprovedComments([
      { id: 1, status: APPROVED_COMMENT_STATUS, content: 'a' },
      { id: 2, content: 'b' },
      { id: 3, status: 'pending', content: 'c' },
    ])
    expect(list).toHaveLength(2)
    expect(list.map(i => i.id)).toEqual([1, 2])
  })

  it('过滤 pending 回复', () => {
    const list = filterApprovedComments([
      {
        id: 1,
        status: APPROVED_COMMENT_STATUS,
        replys: [
          { id: 10, status: APPROVED_COMMENT_STATUS },
          { id: 11, status: 'pending' },
        ],
      },
    ])
    expect(list[0].replys).toHaveLength(1)
  })
})

describe('parseCommentCreateStatus', () => {
  it('解析 pending', () => {
    expect(parseCommentCreateStatus({ status: 'pending' })).toBe('pending')
  })
})

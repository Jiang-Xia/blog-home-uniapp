import { describe, expect, it } from 'vitest'
import { buildMsgboardTree, collectMsgboardDeleteIds } from './msgboard-tree'

describe('buildMsgboardTree', () => {
  it('构建顶层与子回复', () => {
    const tree = buildMsgboardTree([
      { id: 1, pId: 0, comment: 'top' },
      { id: 2, pId: 1, comment: 'reply' },
      { id: 3, pId: 0, comment: 'top2' },
    ])
    expect(tree).toHaveLength(2)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children![0].id).toBe(2)
  })
})

describe('collectMsgboardDeleteIds', () => {
  it('删除顶层时包含子回复', () => {
    const ids = collectMsgboardDeleteIds({ id: 1, children: [{ id: 2 }, { id: 3 }] }, true)
    expect(ids).toEqual([1, 2, 3])
  })
})

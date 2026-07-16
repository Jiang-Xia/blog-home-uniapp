/**
 * 留言板树形结构（对齐 blog-home-nuxt pages/msgboard buildTree）
 * - API 返回扁平列表，pId=0 为顶层留言
 */
export interface MsgboardNode {
  id: number
  pId?: number
  name?: string
  comment?: string
  avatar?: string
  address?: string
  respondent?: string
  createAt?: string
  location?: string
  system?: string
  browser?: string
  children?: MsgboardNode[]
  [key: string]: unknown
}

/** 将扁平留言列表构建为树（仅一层 children，与 Nuxt 一致） */
export function buildMsgboardTree(list: MsgboardNode[], rootId = 0): MsgboardNode[] {
  const tree: MsgboardNode[] = []
  const root = Number(rootId)
  for (const item of list) {
    // Go/部分序列化可能把 pId 成字符串，严格 === 会导致整棵树为空
    if (Number(item.pId ?? 0) === root) {
      const child = buildMsgboardTree(list, item.id)
      if (child.length)
        item.children = child
      tree.push(item)
    }
  }
  return tree
}

/** 收集留言及其直接子回复 ID（管理员删除顶层时使用） */
export function collectMsgboardDeleteIds(item: MsgboardNode, includeChildren: boolean): number[] {
  const ids = [item.id]
  if (includeChildren && item.children?.length)
    ids.push(...item.children.map(c => c.id))
  return ids
}

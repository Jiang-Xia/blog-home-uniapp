/**
 * 评论/回复展示过滤（对齐 blog-home-nuxt/utils/comment.ts）
 * - 前台列表仅展示 status=approved 或历史无 status 字段的数据
 * - pending 评论由 POST 创建接口返回 status 单独提示，不刷新列表
 */
export const APPROVED_COMMENT_STATUS = 'approved'

interface CommentLike {
  status?: string
  replys?: Array<{ status?: string }>
}

/** 过滤待审核、已拒绝的评论及回复，仅保留已通过内容 */
export function filterApprovedComments<T extends CommentLike>(list: T[] | undefined | null): T[] {
  if (!list?.length)
    return []

  return list
    .filter(item => item.status === APPROVED_COMMENT_STATUS || item.status == null)
    .map((item) => {
      if (!item.replys?.length)
        return item
      return {
        ...item,
        replys: item.replys.filter(
          reply => reply.status === APPROVED_COMMENT_STATUS || reply.status == null,
        ),
      }
    })
}

/** 解析 POST /comment/create、/reply/create 返回的审核状态 */
export function parseCommentCreateStatus(res: unknown): 'pending' | 'approved' | string {
  if (!res || typeof res !== 'object')
    return APPROVED_COMMENT_STATUS
  const status = (res as { status?: string }).status
  return status || APPROVED_COMMENT_STATUS
}

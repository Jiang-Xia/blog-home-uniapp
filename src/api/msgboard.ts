/**
 * 留言板 API（对齐 blog-server /msgboard）
 * - 发表/回复 POST /msgboard；删除 POST /msgboard/delete（body 为 ID 数组，需登录）
 */
import { http } from '@/http/http'

export interface MsgboardPostPayload {
  name: string
  eamil: string
  address: string
  comment: string
  pId?: number
  replyId?: number
  respondent?: string
  avatar?: string
  uid?: number
}

/** 对齐 Nest createAt；Go 仅下发 createTime */
function normalizeMsgboardItem(item: any) {
  if (!item || typeof item !== 'object')
    return item
  return {
    ...item,
    createAt: item.createAt ?? item.createTime ?? '',
    pId: Number(item.pId ?? 0),
  }
}

/** 分页查询留言（扁平列表，含 pId） */
export function getMsgboardList(params?: { page?: number, pageSize?: number }) {
  return http.get<{ list: any[], pagination?: { total: number } }>('/msgboard', params).then((res) => {
    if (!res)
      return res
    return {
      ...res,
      list: (res.list ?? []).map(normalizeMsgboardItem),
    }
  })
}

/** 发表留言或回复 POST /msgboard */
export function postMsgboard(data: MsgboardPostPayload) {
  return http.post<any>('/msgboard', data)
}

/** 批量删除留言 POST /msgboard/delete（需 admin/super 角色；Go Bind []int） */
export function deleteMsgboard(ids: Array<number | string>) {
  return http.post<void>('/msgboard/delete', ids.map(id => Number(id)).filter(id => Number.isFinite(id) && id > 0))
}

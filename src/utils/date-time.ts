/**
 * 时间展示工具（dayjs + 相对时间，对齐 blog-home-nuxt formactDate / beforeTimeNow）
 * 数据来源：API 返回的 createTime、createAt、uTime 等字段，仅做前端格式化。
 */
import dayjs from 'dayjs'

/** 绝对时间：YYYY-MM-DD HH:mm:ss（对齐 nuxt formactDate） */
export function formatDate(value?: string | number | Date | null) {
  if (value == null || value === '')
    return ''
  const d = dayjs(value)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : ''
}

/** nuxt 历史命名别名，便于对照迁移 */
export const formactDate = formatDate

/** 归档列表月日：MM-DD */
export function formatArchiveDay(value?: string | number | Date | null) {
  if (value == null || value === '')
    return ''
  const d = dayjs(value)
  return d.isValid() ? d.format('MM-DD') : ''
}

/** 禁言解封等短格式：YYYY-MM-DD HH:mm */
export function formatDateMinute(value?: string | number | Date | null) {
  if (value == null || value === '')
    return ''
  const d = dayjs(value)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : ''
}

/**
 * 相对时间（对齐 nuxt utils/index beforeTimeNow）
 * @param updateTime 毫秒时间戳或可解析的时间字符串
 */
export function beforeTimeNow(updateTime: number | string | null | undefined) {
  if (updateTime == null || updateTime === '')
    return ''

  let ts = updateTime
  if (typeof ts === 'string')
    ts = new Date(ts).getTime()

  ts = Number(ts)
  if (!Number.isFinite(ts))
    return ''

  const now = Date.now()
  const second = Math.floor((now - ts) / 1000)
  const minute = Math.floor(second / 60)
  const hour = Math.floor(minute / 60)
  const day = Math.floor(hour / 24)
  const month = Math.floor(day / 31)
  const year = Math.floor(month / 12)

  if (year > 0)
    return `${year}年前`
  if (month > 0)
    return `${month}月前`
  if (day > 0) {
    if (day >= 7 && day < 14)
      return '1周前'
    if (day >= 14 && day < 21)
      return '2周前'
    if (day >= 21 && day < 28)
      return '3周前'
    if (day >= 28 && day < 31)
      return '4周前'
    return `${day}天前`
  }
  if (hour > 0)
    return `${hour}小时前`
  if (minute > 0)
    return `${minute}分钟前`
  if (second > 0)
    return `${second}秒前`
  return '刚刚'
}

/** 留言/评论等：优先相对时间，无效时回退绝对格式 */
export function formatRelativeTime(value?: string | number | Date | null) {
  if (value == null || value === '')
    return ''
  const relative = beforeTimeNow(value)
  return relative || formatDate(value)
}

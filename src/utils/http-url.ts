/**
 * HTTP(S) 网址规范化与校验（友链申请等）
 * - 无协议时补 https://（对齐用户常见输入）
 * - 不依赖 `URL` 构造函数（旧版微信基础库可能缺失）
 */

/** 去掉首尾空白与常见全角空格 */
function trimUrlInput(url: string) {
  return url.replace(/^\s+|\s+$/g, '')
}

/**
 * 规范化网址：无协议时补 `https://`；已有 http(s) 则原样返回（trim 后）
 * 其它协议（ftp 等）不改写，由 isValidHttpUrl 拒绝
 */
export function normalizeHttpUrl(url: string): string {
  const trimmed = trimUrlInput(url)
  if (!trimmed)
    return ''
  if (/^https?:\/\//i.test(trimmed))
    return trimmed
  // 已有非 http(s) 协议：原样返回，避免拼成 https://ftp://...
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed))
    return trimmed
  // 协议相对 //host/path
  if (trimmed.startsWith('//'))
    return `https:${trimmed}`
  return `https://${trimmed}`
}

/**
 * 校验是否为可用的 http/https 网址（主机名至少含一点号或为 localhost）
 */
export function isValidHttpUrl(url: string): boolean {
  const normalized = normalizeHttpUrl(url)
  if (!normalized || !/^https?:\/\//i.test(normalized))
    return false
  // scheme://host[:port][/path][?query][#hash]
  const re = /^https?:\/\/(?:localhost|(?:[\w-]+\.)+[\w-]+)(?::\d{1,5})?(?:[/?#]\S*)?$/i
  if (re.test(normalized))
    return true
  // 回退：若运行环境支持 URL，再做一次校验（兼容国际化域名等）
  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }
  catch {
    return false
  }
}

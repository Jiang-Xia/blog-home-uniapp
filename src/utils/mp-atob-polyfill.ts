/**
 * 小程序 atob 垫片（须在 highlight.js 等依赖之前加载）
 *
 * highlight.js 语言包内置 base64 grammar，解压逻辑为：
 * `typeof atob === 'function' ? atob(s) : typeof Buffer.from === 'function' ? … : new Buffer(…)`
 * 小程序无 atob 时访问 `Buffer.from` 会 ReferenceError: Buffer is not defined，导致整包 vendor 初始化失败。
 *
 * 数据来源：无；仅补全运行时全局 API。
 */
const globalRef = globalThis as typeof globalThis & { atob?: (input: string) => string }

if (typeof globalRef.atob !== 'function') {
  /**
   * 基于 uni.base64ToArrayBuffer 的 atob 实现，供 highlight.js 解压 grammar 使用
   */
  globalRef.atob = (input: string) => {
    const normalized = input.replace(/\s/g, '')
    const buffer = uni.base64ToArrayBuffer(normalized)
    const bytes = new Uint8Array(buffer)
    let output = ''
    for (let i = 0; i < bytes.length; i++)
      output += String.fromCharCode(bytes[i]!)
    return output
  }
}

export {}

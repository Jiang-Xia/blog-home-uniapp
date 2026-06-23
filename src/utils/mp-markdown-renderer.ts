/**
 * 小程序 Markdown 渲染（markdown-it + highlight.js/lib/core）
 * - 禁止 import 'highlight.js' 全量包：xml/python/haskell 等语言含 \p{} 正则，真机 JS 引擎不支持
 * - 仅注册无 Unicode 属性转义的语言模块
 */
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'

const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  yml: 'yaml',
}

/** 注册小程序端可用的高亮语言（排除 xml / python / haskell） */
function registerSafeLanguages() {
  const entries: Array<[string, typeof javascript]> = [
    ['javascript', javascript],
    ['typescript', typescript],
    ['json', json],
    ['bash', bash],
    ['shell', shell],
    ['css', css],
    ['scss', scss],
    ['sql', sql],
    ['yaml', yaml],
    ['markdown', markdown],
  ]
  for (const [name, mod] of entries) {
    if (!hljs.getLanguage(name))
      hljs.registerLanguage(name, mod)
  }
}

let mdInstance: MarkdownIt | null = null

/** 获取 markdown-it 单例（含代码高亮） */
function getMarkdownIt() {
  if (mdInstance)
    return mdInstance
  registerSafeLanguages()
  mdInstance = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    highlight(str, lang) {
      const normalized = LANG_ALIASES[lang] ?? lang
      if (normalized && hljs.getLanguage(normalized)) {
        try {
          return `<pre class="hljs md-pre"><code>${hljs.highlight(str, { language: normalized, ignoreIllegals: true }).value}</code></pre>`
        }
        catch { /* fall through */ }
      }
      const escaped = mdInstance!.utils.escapeHtml(str)
      return `<pre class="hljs md-pre"><code>${escaped}</code></pre>`
    },
  })
  return mdInstance
}

/** 将 Markdown 源文转为 HTML，供 mp-html 渲染 */
export function renderMpMarkdown(content: string) {
  if (!content)
    return ''
  return getMarkdownIt().render(content)
}

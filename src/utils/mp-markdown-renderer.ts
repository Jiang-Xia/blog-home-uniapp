/**
 * 小程序 Markdown 渲染（markdown-it + highlight.js/lib/core）
 * - 禁止 import 'highlight.js' 全量包：xml/python/haskell 等语言含 \p{} 正则，真机 JS 引擎不支持
 * - 仅注册无 Unicode 属性转义的语言模块
 * - 标题注入 id（heading-N）并同步生成目录，与 H5 MdPreview / article-toc 对齐
 */
import type { ArticleTocItem } from '@/utils/article-toc'
import { mdHeadingId } from '@/utils/article-toc'
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
let headingIdsInstalled = false

interface MpRenderEnv {
  __catalog?: ArticleTocItem[]
  __headingIndex?: number
}

/** 为标题注入 id 并收集目录（与 mdHeadingId 序号一致） */
function installHeadingIds(md: MarkdownIt) {
  if (headingIdsInstalled)
    return
  headingIdsInstalled = true

  const defaultOpen = md.renderer.rules.heading_open
    || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const renderEnv = env as MpRenderEnv
    renderEnv.__headingIndex = (renderEnv.__headingIndex ?? 0) + 1
    const level = token.tag.slice(1)
    const inline = tokens[idx + 1]
    const text = inline?.type === 'inline' ? inline.content : ''

    if (!renderEnv.__catalog)
      renderEnv.__catalog = []

    const id = mdHeadingId({ index: renderEnv.__headingIndex })
    renderEnv.__catalog.push({ level, id, text })
    token.attrSet('id', id)

    return defaultOpen(tokens, idx, options, env, self)
  }
}

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
  installHeadingIds(mdInstance)
  return mdInstance
}

export interface MpMarkdownRenderResult {
  html: string
  catalog: ArticleTocItem[]
}

/** 将 Markdown 源文转为 HTML，供 mp-html 渲染，并提取目录 */
export function renderMpMarkdown(content: string): MpMarkdownRenderResult {
  if (!content)
    return { html: '', catalog: [] }

  const md = getMarkdownIt()
  const env: MpRenderEnv = {}
  const html = md.render(content, env)
  return { html, catalog: env.__catalog ?? [] }
}

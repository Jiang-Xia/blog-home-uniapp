import { describe, expect, it } from 'vitest'
import { renderMpMarkdown } from './mp-markdown-renderer'

describe('mp-markdown-renderer', () => {
  it('渲染时为标题注入 id 并生成目录', () => {
    const { html, catalog } = renderMpMarkdown('# 第一章\n\n## 第一节\n\n正文')

    expect(catalog).toEqual([
      { level: '1', id: 'heading-1', text: '第一章' },
      { level: '2', id: 'heading-2', text: '第一节' },
    ])
    expect(html).toContain('id="heading-1"')
    expect(html).toContain('id="heading-2"')
  })
})

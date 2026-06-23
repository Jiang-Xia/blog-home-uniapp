<script setup lang="ts">
/**
 * Markdown 正文渲染
 * - H5：md-editor MdPreview（代码高亮、图片预览、目录回调）
 * - 小程序/App：markdown-it + mp-html（代码高亮、图片 preview-img）
 */
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.min.css'
import type { ArticleTocItem } from '@/utils/article-toc'
import { mapMdCatalog, mdHeadingId } from '@/utils/article-toc'
// #ifdef H5
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
// #endif
// #ifdef MP
// @ts-expect-error mp-html 无类型声明
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html'
// #endif

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  catalog: [items: ArticleTocItem[]]
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      }
      catch { /* fall through */ }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

const htmlContent = computed(() => {
  if (!props.content)
    return ''
  return md.render(props.content)
})

// #ifdef H5
/** MdPreview 提取目录，供详情页 ArticleToc 使用 */
function onGetCatalog(list: Array<{ level?: number | string, text: string }>) {
  emit('catalog', mapMdCatalog(list))
}
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="markdown-body">
    <MdPreview
      :model-value="content"
      language="zh-CN"
      :md-heading-id="mdHeadingId"
      @on-get-catalog="onGetCatalog"
    />
  </view>
  <!-- #endif -->
  <!-- #ifdef APP-PLUS -->
  <view class="markdown-body">
    <div class="prose max-w-none" v-html="htmlContent" />
  </view>
  <!-- #endif -->
  <!-- #ifdef MP -->
  <mp-html
    :content="htmlContent"
    preview-img
    :tag-style="{ img: 'max-width:100%;height:auto;' }"
  />
  <!-- #endif -->
</template>

<style scoped>
.markdown-body :deep(pre) {
  overflow-x: auto;
  padding: 12px;
  border-radius: 8px;
}
.markdown-body :deep(img) {
  max-width: 100%;
}
</style>

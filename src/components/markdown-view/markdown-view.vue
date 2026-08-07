<script setup lang="ts">
/**
 * Markdown 正文渲染
 * - H5：md-editor MdPreview（default 预览主题 + dark/light，跟随全站 cyber / cyber-light）
 * - 小程序/App：markdown-it + mp-html（见 mp-markdown-renderer，禁用 highlight.js 全量包）
 */
import type { ArticleTocItem } from '@/utils/article-toc'
import { mapMdCatalog, mdHeadingId } from '@/utils/article-toc'
import { useTheme } from '@/composables/use-theme'
// #ifdef H5
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
// #endif
// #ifndef H5
// @ts-expect-error mp-html 无类型声明
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html'
import { renderMpMarkdown } from '@/utils/mp-markdown-renderer'
// #endif

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  catalog: [items: ArticleTocItem[]]
  /** mp-html DOM 就绪（小程序测量目录偏移依赖此时机） */
  rendered: []
}>()

const { isDark, primaryColor } = useTheme()

/** md-editor 仅支持 light / dark */
const mdEditorTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// #ifndef H5
const mpRender = computed(() => renderMpMarkdown(props.content))
const htmlContent = computed(() => mpRender.value.html)

watch(
  () => mpRender.value.catalog,
  catalog => emit('catalog', catalog),
  { immediate: true },
)

function onMpHtmlLoad() {
  emit('rendered')
}
// #endif

/** mp-html 夜间标签样式 */
const mpTagStyleDark: Record<string, string> = {
  h1: 'font-size:40rpx;font-weight:600;color:#fff;margin:32rpx 0 16rpx;line-height:1.4;',
  h2: 'font-size:36rpx;font-weight:600;color:#fff;margin:32rpx 0 16rpx;line-height:1.4;',
  h3: 'font-size:32rpx;font-weight:600;color:#fff;margin:28rpx 0 12rpx;line-height:1.4;',
  h4: 'font-size:30rpx;font-weight:600;color:#fff;margin:24rpx 0 12rpx;',
  h5: 'font-size:28rpx;font-weight:600;color:#fff;margin:20rpx 0 8rpx;',
  h6: 'font-size:26rpx;font-weight:600;color:#fff;margin:20rpx 0 8rpx;',
  p: 'font-size:28rpx;line-height:1.75;color:rgba(255,255,255,0.55);margin:16rpx 0;',
  a: 'color:#22d3ee;text-decoration:underline;',
  blockquote: 'margin:16rpx 0;padding:12rpx 24rpx;border-left:6rpx solid #22d3ee;background:rgba(34,211,238,0.06);color:rgba(255,255,255,0.4);',
  pre: 'margin:16rpx 0;padding:24rpx;border-radius:12rpx;background:#0d1117;border:1px solid rgba(255,255,255,0.1);overflow-x:auto;',
  code: 'font-size:26rpx;color:#e6edf3;',
  ul: 'margin:16rpx 0;padding-left:40rpx;list-style:disc;color:rgba(255,255,255,0.55);',
  ol: 'margin:16rpx 0;padding-left:40rpx;list-style:decimal;color:rgba(255,255,255,0.55);',
  li: 'margin:8rpx 0;line-height:1.75;',
  hr: 'margin:32rpx 0;border:none;border-top:1px solid rgba(255,255,255,0.1);',
  table: 'width:100%;border-collapse:collapse;font-size:26rpx;margin:16rpx 0;',
  th: 'border:1px solid rgba(255,255,255,0.1);padding:12rpx 16rpx;background:rgba(255,255,255,0.06);color:#fff;',
  td: 'border:1px solid rgba(255,255,255,0.1);padding:12rpx 16rpx;color:rgba(255,255,255,0.55);',
  img: 'max-width:100%;height:auto;border-radius:8rpx;margin:16rpx 0;',
  strong: 'color:#fff;font-weight:600;',
  em: 'font-style:italic;',
}

/** 按当前主题生成 mp-html 标签样式（小程序无法用 CSS 变量注入 tag-style） */
const mpTagStyle = computed(() => {
  if (isDark.value)
    return mpTagStyleDark
  const primary = primaryColor.value
  return {
    h1: 'font-size:40rpx;font-weight:600;color:#0f172a;margin:32rpx 0 16rpx;line-height:1.4;',
    h2: 'font-size:36rpx;font-weight:600;color:#0f172a;margin:32rpx 0 16rpx;line-height:1.4;',
    h3: 'font-size:32rpx;font-weight:600;color:#0f172a;margin:28rpx 0 12rpx;line-height:1.4;',
    h4: 'font-size:30rpx;font-weight:600;color:#0f172a;margin:24rpx 0 12rpx;',
    h5: 'font-size:28rpx;font-weight:600;color:#0f172a;margin:20rpx 0 8rpx;',
    h6: 'font-size:26rpx;font-weight:600;color:#0f172a;margin:20rpx 0 8rpx;',
    p: 'font-size:28rpx;line-height:1.75;color:rgba(15,23,42,0.62);margin:16rpx 0;',
    a: `color:${primary};text-decoration:underline;`,
    blockquote: `margin:16rpx 0;padding:12rpx 24rpx;border-left:6rpx solid ${primary};background:rgba(8,145,178,0.06);color:rgba(15,23,42,0.48);`,
    pre: 'margin:16rpx 0;padding:24rpx;border-radius:12rpx;background:#f1f5f9;border:1px solid rgba(15,23,42,0.12);overflow-x:auto;',
    code: 'font-size:26rpx;color:#334155;',
    ul: 'margin:16rpx 0;padding-left:40rpx;list-style:disc;color:rgba(15,23,42,0.62);',
    ol: 'margin:16rpx 0;padding-left:40rpx;list-style:decimal;color:rgba(15,23,42,0.62);',
    li: 'margin:8rpx 0;line-height:1.75;',
    hr: 'margin:32rpx 0;border:none;border-top:1px solid rgba(15,23,42,0.12);',
    table: 'width:100%;border-collapse:collapse;font-size:26rpx;margin:16rpx 0;',
    th: 'border:1px solid rgba(15,23,42,0.12);padding:12rpx 16rpx;background:rgba(15,23,42,0.04);color:#0f172a;',
    td: 'border:1px solid rgba(15,23,42,0.12);padding:12rpx 16rpx;color:rgba(15,23,42,0.62);',
    img: 'max-width:100%;height:auto;border-radius:8rpx;margin:16rpx 0;',
    strong: 'color:#0f172a;font-weight:600;',
    em: 'font-style:italic;',
  }
})

// #ifdef H5
/** MdPreview 提取目录，供详情页 ArticleToc 使用 */
function onGetCatalog(list: Array<{ level?: number | string, text: string }>) {
  emit('catalog', mapMdCatalog(list))
  nextTick(() => emit('rendered'))
}
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <MdPreview
    class="x-md-editor article-md-content"
    :model-value="content"
    language="zh-CN"
    preview-only
    :theme="mdEditorTheme"
    preview-theme="default"
    :md-heading-id="mdHeadingId"
    @on-get-catalog="onGetCatalog"
  />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="markdown-body-mp article-md-content">
    <mp-html
      :content="htmlContent"
      :use-anchor="true"
      preview-img
      :tag-style="mpTagStyle"
      @load="onMpHtmlLoad"
    />
  </view>
  <!-- #endif -->
</template>

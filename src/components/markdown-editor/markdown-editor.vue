<script lang="ts" setup>
/**
 * H5 Markdown 编辑器封装（md-editor-v3）
 * - 非 H5 降级为 wd-textarea
 * - H5 支持 @onUploadImg → POST /resources/upload-media?category=article
 */
// #ifdef H5
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { uploadArticleImage } from '@/api/article'
// #endif

const modelValue = defineModel<string>({ default: '' })

// #ifdef H5
/** md-editor 粘贴/拖拽图片上传，回调插入完整 URL */
async function onUploadImg(files: File[], callback: (urls: string[]) => void) {
  try {
    const urls = await Promise.all(files.map(file => uploadArticleImage(file)))
    callback(urls)
  }
  catch {
    uni.showToast({ title: '图片上传失败', icon: 'none' })
  }
}
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="markdown-editor">
    <MdEditor
      v-model="modelValue"
      language="zh-CN"
      :toolbars-exclude="['github', 'prettier', 'mermaid']"
      style="height: 420px"
      @on-upload-img="onUploadImg"
    />
  </view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <wd-textarea v-model="modelValue" placeholder="Markdown 正文" :maxlength="-1" />
  <!-- #endif -->
</template>

<style scoped>
.markdown-editor :deep(.md-editor) {
  border-radius: 8px;
}
</style>

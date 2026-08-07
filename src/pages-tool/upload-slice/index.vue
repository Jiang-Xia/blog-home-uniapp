<script lang="ts" setup>
/**
 * 大文件分片上传 — 对齐 Nuxt upload-slice，2MB 分片 + 断点续传
 */
import { useUploadSlice } from '@/composables/tool/use-upload-slice'

definePage({
  style: { navigationBarTitleText: '分片上传' },
})

const {
  fileName,
  fileHash,
  loading,
  starting,
  progressValue,
  statusLabel,
  pickFile,
  togglePause,
} = useUploadSlice()
</script>

<template>
  <scroll-view scroll-y class="upload-slice-page cyber-page-grid u-page-scroll u-page-body py-4">
    <tool-card title="分片上传" desc="大文件分片上传与合并（2MB 分片，并发 3）">
      <view class="u-stack-4 flex flex-col items-center">
        <view class="max-w-md w-full">
          <wd-button block @click="pickFile">
            选择文件
          </wd-button>
        </view>

        <view v-if="fileName" class="upload-panel max-w-md w-full">
          <view class="u-stack-2">
            <text class="block truncate text-sm text-tech">{{ fileName }}</text>
            <text v-if="fileHash" class="block truncate text-xs text-tech-subtle">hash: {{ fileHash }}</text>
            <view class="progress-track">
              <view class="progress-fill" :style="{ width: `${progressValue}%` }" />
            </view>
            <view class="flex items-center justify-between">
              <text class="text-xs text-tech-muted">{{ progressValue }}% · {{ statusLabel }}</text>
              <view v-if="progressValue < 100">
                <wd-button size="small" @click="togglePause">
                  {{ starting ? '暂停' : '继续' }}
                </wd-button>
              </view>
            </view>
          </view>
        </view>

        <text v-if="loading" class="text-sm text-tech-muted">处理中…</text>
      </view>
    </tool-card>
  </scroll-view>
</template>

<style scoped>
.upload-panel {
  padding: 16px;
  border: 1px solid var(--tech-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  background: var(--tech-input-bg, rgba(255, 255, 255, 0.04));
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--tech-border, rgba(255, 255, 255, 0.12));
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--tech-accent, #37cdbe);
  transition: width 0.3s ease;
}
</style>

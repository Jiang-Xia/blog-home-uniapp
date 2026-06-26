<script lang="ts" setup>
/**
 * 友情链接页（对齐 blog-home-nuxt /links）
 * - 数据字段：title / icon / desp / url（与 blog-server Link 实体一致）
 * - 支持申请外链 POST /link
 */
import type { LinkItem } from '@/api/link'
import { createLink, getLinks } from '@/api/link'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: { navigationBarTitleText: '友链' },
})

const links = ref<LinkItem[]>([])
const loading = ref(true)
const showApplyPopup = ref(false)
const submitting = ref(false)

const linkForm = reactive({
  title: '',
  url: '',
  icon: '',
  desp: '',
})

onLoad(async () => {
  await reloadLinks()
})

/** 拉取友链列表 */
async function reloadLinks() {
  loading.value = true
  try {
    links.value = await getLinks() ?? []
  }
  finally {
    loading.value = false
  }
}

function linkIcon(icon: string) {
  return resolveStaticUrl(icon)
}

function openUrl(url: string) {
  if (!url)
    return
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) })
  // #endif
}

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }
  catch {
    return false
  }
}

function resetForm() {
  linkForm.title = ''
  linkForm.url = ''
  linkForm.icon = ''
  linkForm.desp = ''
}

function openApply() {
  resetForm()
  showApplyPopup.value = true
}

/** 提交友链申请，审核通过后展示 */
async function submitApply() {
  if (submitting.value)
    return
  if (!linkForm.title.trim() || !linkForm.url.trim() || !linkForm.icon.trim() || !linkForm.desp.trim()) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (!isValidUrl(linkForm.url.trim())) {
    uni.showToast({ title: '请输入有效的 http/https 网址', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await createLink({
      title: linkForm.title.trim(),
      url: linkForm.url.trim(),
      icon: linkForm.icon.trim(),
      desp: linkForm.desp.trim(),
    })
    showApplyPopup.value = false
    resetForm()
    await reloadLinks()
    uni.showToast({ title: '申请已提交，等待站长审核', icon: 'none', duration: 3000 })
  }
  catch {
    uni.showToast({ title: '申请失败，请稍后重试', icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <scroll-view scroll-y class="links-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-3">
      <cyber-section-header
        class="mb-4"
        label="LINKS"
        title="友情链接"
        subtitle="与志同道合的站点互联互通"
        align="left"
      />

      <view class="links-apply-row">
        <cyber-button size="small" variant="primary" @click="openApply">
          + 申请外链
        </cyber-button>
      </view>

      <view v-if="loading" class="py-8 text-center text-tech-subtle">
        加载中...
      </view>
      <view v-else-if="!links.length" class="py-8 text-center text-tech-subtle">
        暂无友链，欢迎申请~
      </view>

      <cyber-card
        v-for="link in links"
        :key="link.id || link.url"
        class="cyber-card-pad-sm mb-3"
        @click="openUrl(link.url)"
      >
        <view class="cyber-card-row u-gap-3">
          <image
            v-if="link.icon"
            :src="linkIcon(link.icon)"
            class="h-10 w-10 shrink-0 border border-tech rounded-full"
            mode="aspectFill"
          />
          <view class="u-flex-1">
            <text class="block text-tech font-medium">{{ link.title }}</text>
            <text class="text-xs text-tech-muted">{{ link.desp }}</text>
          </view>
        </view>
      </cyber-card>
    </view>

    <wd-popup v-model="showApplyPopup" position="bottom" closable @close="showApplyPopup = false">
      <view class="apply-popup cyber-page p-4">
        <text class="mb-4 block text-lg text-tech font-medium">申请外链</text>
        <wd-input v-model="linkForm.title" label="网站名" placeholder="网站名" required />
        <wd-input v-model="linkForm.url" label="网址" placeholder="https://..." class="mt-3" required />
        <wd-input v-model="linkForm.icon" label="图标" placeholder="图标 URL" class="mt-3" required />
        <wd-input v-model="linkForm.desp" label="个签" placeholder="站点简介" class="mt-3" required />
        <view class="u-form-actions mt-4">
          <view class="u-form-action-item">
            <cyber-button block variant="primary" @click="submitApply">
              {{ submitting ? '提交中...' : '确认' }}
            </cyber-button>
          </view>
        </view>
      </view>
    </wd-popup>
  </scroll-view>
</template>

<style scoped>
.links-apply-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 24rpx;
}

.apply-popup {
  padding-bottom: 32rpx;
}

/* #ifdef H5 */
.apply-popup {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>

<script lang="ts" setup>
/**
 * 用户文章编辑页（新建/编辑）
 * - H5 md-editor 正文；封面 uni.uploadFile
 * - 本地草稿 uni.storage debounce 3s（新建默认可恢复）
 */
import { createArticle, editArticle, getArticleInfo, parseArticleDetail } from '@/api/article'
import { getAllCategory } from '@/api/category'
import { uploadCover } from '@/api/resources'
import { getAllTag } from '@/api/tag'
import MarkdownEditor from '@/components/markdown-editor/markdown-editor.vue'
import { ROUTE_DETAIL, ROUTE_PROFILE } from '@/router/routes'
import { useTokenStore } from '@/store/token'
import { debounce } from '@/utils/debounce'
import { apiDisplayLabel } from '@/utils/display-label'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  style: { navigationBarTitleText: '编辑文章' },
})

const tokenStore = useTokenStore()
const articleId = ref('')
const isEdit = computed(() => !!articleId.value)
const loading = ref(false)
const submitting = ref(false)
const draftRestored = ref(false)
const categories = ref<any[]>([])
const tags = ref<any[]>([])

const form = reactive({
  title: '',
  description: '',
  content: '**写下你的灵感~**',
  category: '',
  cover: '',
  tags: [] as number[],
  status: 'publish' as 'publish' | 'draft' | 'scheduled',
  scheduledPublishAt: '',
})

/** 草稿 storage key；新建与编辑分 key */
const draftStorageKey = computed(() => `draft:${articleId.value || 'new'}`)

const coverDisplayUrl = computed(() => resolveStaticUrl(form.cover))

/** debounce 3s 写入本地草稿，防止意外丢失 */
const saveDraftToLocal = debounce(() => {
  if (submitting.value)
    return
  uni.setStorageSync(draftStorageKey.value, JSON.stringify({ ...form, savedAt: Date.now() }))
}, 3000)

/** 清除本地草稿（发布/保存成功后） */
function clearLocalDraft() {
  uni.removeStorageSync(draftStorageKey.value)
}

/** 新建文章时尝试恢复草稿 */
function tryRestoreDraft() {
  if (isEdit.value)
    return
  try {
    const raw = uni.getStorageSync(draftStorageKey.value)
    if (!raw)
      return
    const draft = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (draft.title || draft.content) {
      Object.assign(form, {
        title: draft.title ?? '',
        description: draft.description ?? '',
        content: draft.content ?? form.content,
        category: draft.category ?? '',
        cover: draft.cover ?? '',
        tags: Array.isArray(draft.tags) ? draft.tags : [],
        status: draft.status ?? 'publish',
      })
      draftRestored.value = true
    }
  }
  catch {
    // ignore invalid draft
  }
}

watch(form, () => saveDraftToLocal(), { deep: true })

onLoad(async (query) => {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  articleId.value = String(query?.id ?? '')
  uni.setNavigationBarTitle({ title: isEdit.value ? '编辑文章' : '写文章' })
  loading.value = true
  try {
    const [catList, tagList] = await Promise.all([getAllCategory(), getAllTag()])
    categories.value = catList ?? []
    tags.value = tagList ?? []
    if (isEdit.value) {
      const raw = await getArticleInfo({ id: articleId.value })
      const { info } = parseArticleDetail(raw)
      if (info) {
        form.title = String(info.title ?? '')
        form.description = String(info.description ?? '')
        form.content = String(info.content ?? '')
        form.cover = String(info.cover ?? '')
        form.category = String((info.category as any)?.id ?? info.category ?? '')
        form.tags = Array.isArray(info.tags) ? info.tags.map((t: any) => t.id) : []
        form.status = (info.status as 'publish' | 'draft' | 'scheduled') || 'publish'
        if (info.scheduledPublishAt)
          form.scheduledPublishAt = String(info.scheduledPublishAt).replace(' ', 'T').slice(0, 16)
      }
    }
    else {
      tryRestoreDraft()
    }
  }
  finally {
    loading.value = false
  }
})

function onCategoryChange(e: { detail: { value: number } }) {
  form.category = String(categories.value[e.detail.value]?.id ?? '')
}

/** 选择并上传封面 */
async function pickCover() {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const path = res.tempFilePaths[0]
      if (!path)
        return
      uni.showLoading({ title: '上传中' })
      try {
        form.cover = await uploadCover(path)
        uni.showToast({ title: '封面上传成功', icon: 'success' })
      }
      catch {
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
      finally {
        uni.hideLoading()
      }
    },
  })
}

function toggleTag(id: number) {
  const idx = form.tags.indexOf(id)
  if (idx >= 0)
    form.tags.splice(idx, 1)
  else
    form.tags.push(id)
}

/** 提交创建/更新；成功后清除草稿 */
function onScheduledDateChange(e: { detail: { value: string } }) {
  const date = e.detail.value
  const time = form.scheduledPublishAt.includes('T') ? form.scheduledPublishAt.split('T')[1] : '12:00'
  form.scheduledPublishAt = `${date}T${time}`
}

function onScheduledTimeChange(e: { detail: { value: string } }) {
  const time = e.detail.value
  const date = form.scheduledPublishAt.includes('T') ? form.scheduledPublishAt.split('T')[0] : ''
  if (date)
    form.scheduledPublishAt = `${date}T${time}`
  else
    form.scheduledPublishAt = `T${time}`
}

const scheduledDateValue = computed(() =>
  form.scheduledPublishAt.includes('T') ? form.scheduledPublishAt.split('T')[0] : '',
)

const scheduledTimeValue = computed(() =>
  form.scheduledPublishAt.includes('T') ? form.scheduledPublishAt.split('T')[1] : '12:00',
)

async function submit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请填写标题', icon: 'none' })
    return
  }
  if (form.status === 'scheduled' && !scheduledDateValue.value) {
    uni.showToast({ title: '请选择定时发布时间', icon: 'none' })
    return
  }
  submitting.value = true
  saveDraftToLocal.cancel()
  try {
    const params: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content,
      contentHtml: '',
      category: form.category,
      cover: form.cover,
      tags: form.tags,
      status: form.status,
      scheduledPublishAt:
        form.status === 'scheduled'
          ? `${scheduledDateValue.value} ${scheduledTimeValue.value}:00`
          : undefined,
    }
    if (isEdit.value) {
      params.id = Number(articleId.value)
      await editArticle(params)
      clearLocalDraft()
      uni.showToast({ title: '更新成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${articleId.value}` })
      }, 500)
    }
    else {
      const created = await createArticle(params)
      clearLocalDraft()
      const newId = created?.id ?? created?.info?.id
      uni.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => {
        if (newId)
          uni.navigateTo({ url: `${ROUTE_DETAIL}?id=${newId}` })
        else
          uni.navigateTo({ url: ROUTE_PROFILE })
      }, 500)
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view v-if="loading" class="cyber-page-grid p-8 text-center text-tech-subtle">
    加载中...
  </view>
  <scroll-view v-else scroll-y class="edit-page cyber-page-grid u-page-scroll">
    <view class="p-4">
      <cyber-alert v-if="draftRestored" class="mb-3" variant="warning">
        <text class="text-xs text-tech-muted">已恢复本地草稿</text>
      </cyber-alert>
      <cyber-card class="!p-4">
        <wd-input v-model="form.title" label="标题" placeholder="文章标题" />
        <wd-input v-model="form.description" label="摘要" placeholder="简短描述" class="mt-3" />
        <view class="mt-3">
          <text class="mb-1 block text-sm text-tech-muted">封面</text>
          <view v-if="form.cover" class="article-cover-wrap article-edit-cover mb-2">
            <image :src="coverDisplayUrl" mode="aspectFill" class="article-cover-wrap__img article-edit-cover__img" />
          </view>
          <wd-button size="small" @click="pickCover">
            选择封面
          </wd-button>
        </view>
        <view class="mt-3">
          <text class="mb-1 block text-sm text-tech-muted">分类</text>
          <picker :range="categories" range-key="label" @change="onCategoryChange">
            <view class="border border-tech rounded px-3 py-2 text-sm text-tech">
              {{ apiDisplayLabel(categories.find(c => String(c.id) === form.category), '选择分类') }}
            </view>
          </picker>
        </view>
        <view class="mt-3">
          <text class="mb-1 block text-sm text-tech-muted">标签</text>
          <view class="u-gap-2 flex flex-wrap">
            <text
              v-for="tag in tags"
              :key="tag.id"
              class="rounded px-2 py-1 text-xs"
              :class="form.tags.includes(tag.id) ? 'cyber-feature-tag border-[rgba(34,211,238,0.6)]' : 'border border-tech text-tech-muted'"
              @click="toggleTag(tag.id)"
            >
              {{ apiDisplayLabel(tag) }}
            </text>
          </view>
        </view>
        <view class="mt-3">
          <text class="mb-1 block text-sm text-tech-muted">正文（Markdown）</text>
          <MarkdownEditor v-model="form.content" />
        </view>
        <view class="mt-3">
          <text class="mb-1 block text-sm text-tech-muted">状态</text>
          <view class="u-gap-2 flex flex-wrap">
            <wd-button size="small" :type="form.status === 'publish' ? 'primary' : undefined" @click="form.status = 'publish'">
              发布
            </wd-button>
            <wd-button size="small" :type="form.status === 'draft' ? 'primary' : undefined" @click="form.status = 'draft'">
              草稿
            </wd-button>
            <wd-button size="small" :type="form.status === 'scheduled' ? 'primary' : undefined" @click="form.status = 'scheduled'">
              定时发布
            </wd-button>
          </view>
        </view>
        <view v-if="form.status === 'scheduled'" class="u-stack-3 mt-3">
          <view>
            <text class="mb-1 block text-sm text-tech-muted">发布日期</text>
            <picker mode="date" :value="scheduledDateValue" @change="onScheduledDateChange">
              <view class="border border-tech rounded px-3 py-2 text-sm text-tech">
                {{ scheduledDateValue || '选择日期' }}
              </view>
            </picker>
          </view>
          <view>
            <text class="mb-1 block text-sm text-tech-muted">发布时间</text>
            <picker mode="time" :value="scheduledTimeValue" @change="onScheduledTimeChange">
              <view class="border border-tech rounded px-3 py-2 text-sm text-tech">
                {{ scheduledTimeValue }}
              </view>
            </picker>
          </view>
        </view>
        <view class="u-form-actions">
          <view class="u-form-action-item">
            <cyber-button block variant="primary" @click="submit">
              {{ isEdit ? '保存更新' : '创建文章' }}
            </cyber-button>
          </view>
        </view>
      </cyber-card>
    </view>
  </scroll-view>
</template>

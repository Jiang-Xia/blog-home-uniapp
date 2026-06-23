<script lang="ts" setup>
/**
 * 留言板页（对齐 blog-home-nuxt /msgboard）
 * - 扁平列表分页 + buildTree 楼中楼
 * - 访客需填昵称/邮箱/主页；登录用户自动带昵称
 * - admin/super 可删除留言及子回复
 */
import { deleteMsgboard, getMsgboardList, postMsgboard } from '@/api/msgboard'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { buildMsgboardTree, collectMsgboardDeleteIds } from '@/utils/msgboard-tree'
import type { MsgboardNode } from '@/utils/msgboard-tree'
import { formatRelativeTime } from '@/utils/date-time'
import { getRandomNickname } from '@/utils/nickname'
import { resolveStaticUrl } from '@/utils/static-url'

definePage({
  excludeLoginPath: true,
  style: { navigationBarTitleText: '留言板' },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()

const flatList = ref<MsgboardNode[]>([])
const msgboardTree = ref<MsgboardNode[]>([])
const page = ref(1)
const pageSize = 30
const hasMore = ref(true)
const listLoading = ref(false)
const submitting = ref(false)

const showReplyPopup = ref(false)
const replyTarget = ref<MsgboardNode | null>(null)
const replyForm = reactive({ name: '', comment: '' })

const msgForm = reactive({
  name: '',
  eamil: '',
  address: '',
  comment: '',
})

/** 管理员可删留言 */
const showDelBtn = computed(() => {
  const role = userStore.userInfo.role
  return tokenStore.hasLogin && (role === 'admin' || role === 'super')
})

function resolveFormName() {
  return userStore.userInfo.userId > 0 ? userStore.userInfo.nickname : getRandomNickname()
}

function rebuildTree() {
  msgboardTree.value = buildMsgboardTree(flatList.value)
}

/** 首屏 / 刷新留言 */
async function reloadMsgboard() {
  page.value = 1
  listLoading.value = true
  try {
    const res = await getMsgboardList({ page: 1, pageSize })
    flatList.value = res?.list ?? []
    hasMore.value = flatList.value.length < (res?.pagination?.total ?? flatList.value.length)
    rebuildTree()
  }
  finally {
    listLoading.value = false
  }
}

/** 加载更多顶层分页数据 */
async function loadMoreMsgboard() {
  if (listLoading.value || !hasMore.value)
    return
  listLoading.value = true
  try {
    page.value += 1
    const res = await getMsgboardList({ page: page.value, pageSize })
    const items = res?.list ?? []
    flatList.value = [...flatList.value, ...items]
    hasMore.value = flatList.value.length < (res?.pagination?.total ?? flatList.value.length)
    rebuildTree()
  }
  finally {
    listLoading.value = false
  }
}

onShow(() => {
  msgForm.name = resolveFormName()
  void reloadMsgboard()
})

/** 发表顶层留言 */
async function submitMessage() {
  if (submitting.value)
    return
  if (!msgForm.name.trim() || !msgForm.eamil.trim() || !msgForm.address.trim() || !msgForm.comment.trim()) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  const emailReg = /^[\w-]+@[\w-]+\.[\w-]+$/
  if (!emailReg.test(msgForm.eamil)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await postMsgboard({
      name: msgForm.name.trim(),
      eamil: msgForm.eamil.trim(),
      address: msgForm.address.trim(),
      comment: msgForm.comment.trim(),
      avatar: userStore.userInfo.avatar,
      uid: userStore.userInfo.userId > 0 ? userStore.userInfo.userId : undefined,
    })
    uni.showToast({ title: '留言发表成功', icon: 'success' })
    msgForm.name = resolveFormName()
    msgForm.eamil = ''
    msgForm.address = ''
    msgForm.comment = ''
    await reloadMsgboard()
  }
  catch {
    uni.showToast({ title: '发表失败，请稍后重试', icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}

/** 打开回复弹层 */
function openReply(item: MsgboardNode) {
  replyTarget.value = item
  replyForm.name = resolveFormName()
  replyForm.comment = ''
  showReplyPopup.value = true
}

function closeReply() {
  showReplyPopup.value = false
  replyTarget.value = null
}

/** 提交楼中楼回复 */
async function submitReply() {
  const target = replyTarget.value
  if (!target)
    return
  if (!replyForm.name.trim() || !replyForm.comment.trim()) {
    uni.showToast({ title: '请填写名称与内容', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const rootPid = target.pId && target.pId !== 0 ? target.pId : target.id
    await postMsgboard({
      pId: rootPid,
      name: replyForm.name.trim(),
      replyId: target.id,
      respondent: target.name || '用户',
      eamil: '',
      address: '',
      comment: replyForm.comment.trim(),
      avatar: userStore.userInfo.avatar,
      uid: userStore.userInfo.userId > 0 ? userStore.userInfo.userId : undefined,
    })
    uni.showToast({ title: '回复成功', icon: 'success' })
    closeReply()
    await reloadMsgboard()
  }
  catch {
    uni.showToast({ title: '回复失败', icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}

/** 管理员删除留言（顶层含子回复） */
async function handleDelete(isTopLevel: boolean, item: MsgboardNode) {
  if (!showDelBtn.value)
    return
  uni.showModal({
    title: '删除留言',
    content: '确定删除该留言吗？',
    confirmColor: '#dc2626',
    success: async (res) => {
      if (!res.confirm)
        return
      try {
        await deleteMsgboard(collectMsgboardDeleteIds(item, isTopLevel))
        uni.showToast({ title: '删除成功', icon: 'success' })
        await reloadMsgboard()
      }
      catch {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },
  })
}

function avatarUrl(item: MsgboardNode) {
  return resolveStaticUrl(String(item.avatar || ''))
}
</script>

<template>
  <scroll-view scroll-y class="msgboard-page cyber-page-grid u-page-scroll">
    <view class="p-3">
      <cyber-section-header
        class="mb-4"
        label="MSGBOARD"
        title="留言板"
        subtitle="欢迎留下你的想法"
        align="left"
      />

      <cyber-card class="mb-4 !p-4">
        <text class="mb-3 block text-tech font-medium">发表留言</text>
        <wd-input v-model="msgForm.name" label="昵称" placeholder="您的昵称" maxlength="10" />
        <wd-input v-model="msgForm.eamil" label="邮箱" placeholder="您的邮箱" class="mt-2" maxlength="30" />
        <wd-input v-model="msgForm.address" label="主页" placeholder="您的主页 URL" class="mt-2" maxlength="30" />
        <wd-textarea v-model="msgForm.comment" label="留言" placeholder="写下你的想法..." class="mt-2" :maxlength="800" />
        <cyber-button size="small" class="mt-3 inline-flex" variant="primary" @click="submitMessage">
          发表
        </cyber-button>
      </cyber-card>

      <view v-if="listLoading && !msgboardTree.length" class="py-8 text-center text-tech-subtle">
        加载中...
      </view>
      <cyber-card v-else-if="!msgboardTree.length" class="py-12 text-center !p-4">
        <text class="text-tech-subtle">还没有留言，来抢沙发吧~</text>
      </cyber-card>

      <cyber-card
        v-for="item in msgboardTree"
        :key="item.id"
        class="mb-3 !p-4"
      >
        <view class="u-gap-2 flex items-start">
          <image :src="avatarUrl(item)" class="h-8 w-8 shrink-0 border border-tech rounded-full" mode="aspectFill" />
          <view class="min-w-0 flex-1">
            <view class="flex items-center justify-between">
              <text class="text-sm text-tech font-medium">{{ item.name }}</text>
              <text v-if="showDelBtn" class="text-xs text-red-400" @click="handleDelete(true, item)">删除</text>
            </view>
            <text class="mt-1 block text-xs text-tech-subtle">{{ formatRelativeTime(item.createAt) }}</text>
            <text class="mt-2 block text-sm text-tech-muted">{{ item.comment }}</text>
            <view class="u-gap-2 mt-2 flex flex-wrap text-xs text-tech-subtle">
              <text class="text-tech-primary" @click="openReply(item)">回复</text>
              <text v-if="item.location">📍 {{ item.location }}</text>
            </view>

            <view v-if="item.children?.length" class="mt-3 border-l-2 border-tech pl-3">
              <view v-for="reply in item.children" :key="reply.id" class="mb-3">
                <view class="u-gap-2 flex items-start">
                  <image :src="avatarUrl(reply)" class="h-7 w-7 shrink-0 border border-tech rounded-full" mode="aspectFill" />
                  <view class="min-w-0 flex-1">
                    <view class="flex items-center justify-between">
                      <text class="text-xs text-tech font-medium">
                        {{ reply.name }}
                        <text v-if="reply.respondent" class="text-tech-subtle"> @ {{ reply.respondent }}</text>
                      </text>
                      <text v-if="showDelBtn" class="text-xs text-red-400" @click="handleDelete(false, reply)">删除</text>
                    </view>
                    <text class="mt-1 block text-xs text-tech-subtle">{{ formatRelativeTime(reply.createAt) }}</text>
                    <text class="mt-1 block text-sm text-tech-muted">{{ reply.comment }}</text>
                    <text class="mt-1 inline-block text-xs text-tech-primary" @click="openReply(reply)">回复</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </cyber-card>

      <view v-if="hasMore" class="py-4 text-center">
        <cyber-button size="small" variant="secondary" @click="loadMoreMsgboard">
          {{ listLoading ? '加载中...' : '加载更多留言' }}
        </cyber-button>
      </view>
    </view>

    <wd-popup v-model="showReplyPopup" position="bottom" closable @close="closeReply">
      <view class="reply-popup cyber-page p-4">
        <text class="mb-3 block text-tech font-medium">回复留言</text>
        <wd-input v-model="replyForm.name" label="名称" placeholder="你的名称" maxlength="10" />
        <wd-textarea v-model="replyForm.comment" label="内容" placeholder="写下回复..." class="mt-2" :maxlength="300" />
        <view class="u-form-actions">
          <view class="u-form-action-item">
            <cyber-button block variant="primary" @click="submitReply">
              确认
            </cyber-button>
          </view>
        </view>
      </view>
    </wd-popup>
  </scroll-view>
</template>

<style scoped>
/* #ifdef H5 */
.reply-popup {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
/* #endif */

/* #ifdef MP-WEIXIN || MP-ALIPAY */
.reply-popup {
  padding-bottom: 32rpx;
}
/* #endif */
</style>

<script lang="ts" setup>
/**
 * 公会面板（对齐 blog-home-nuxt GuildPanel）
 * 成员头像/昵称跳转 ROUTE_USER_PUBLIC；创建公会用 wd-input
 */
import { ROUTE_USER_PUBLIC } from '@/router/routes'
import { useUserStore } from '@/store'
import { getGuildRoleLabel } from '@/types/rpg'
import { resolveStaticUrl } from '@/utils/static-url'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  myGuild: any
  guildList: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  create: [name: string]
  join: [guildId: number]
  leave: []
}>()

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const guildName = ref('')

const isLeader = computed(() => {
  const uid = userInfo.value?.uid ?? userInfo.value?.userId
  return !!uid && props.myGuild?.leaderUid === uid
})

/** 跳转用户公开主页 */
function goUserPublic(uid: number) {
  if (!uid)
    return
  uni.navigateTo({ url: `${ROUTE_USER_PUBLIC}?uid=${uid}` })
}

function submitCreate() {
  const name = guildName.value.trim()
  if (!name)
    return
  emit('create', name)
  guildName.value = ''
}
</script>

<template>
  <view class="guild-panel">
    <view v-if="loading" class="guild-panel__loading">
      <text class="text-sm text-tech-subtle">加载中…</text>
    </view>
    <view v-else-if="myGuild">
      <cyber-card class="guild-mine cyber-card-pad-sm">
        <view class="u-flex-row-center flex items-center justify-between">
          <text class="text-tech font-bold">{{ myGuild.name }}</text>
          <text class="text-xs text-green-400">我的公会</text>
        </view>
        <text class="mt-2 block text-sm text-tech-muted">
          {{ myGuild.announcement || '暂无公告' }}
        </text>
        <text class="guild-mine__count mt-2 inline-block text-xs text-tech-subtle">
          👥 {{ myGuild.memberCount }} 人
        </text>

        <view
          v-if="myGuild.members?.length"
          class="u-grid-2 u-grid-2--loose mt-3"
        >
          <view
            v-for="m in myGuild.members"
            :key="m.uid"
            class="u-grid-2-item"
          >
            <cyber-card class="member-card cyber-card-pad-sm" @click="goUserPublic(m.uid)">
              <view class="u-gap-2 u-flex-row-center">
                <view class="member-avatar">
                  <image
                    v-if="m.avatar"
                    :src="resolveStaticUrl(m.avatar)"
                    class="member-avatar__img"
                    mode="aspectFill"
                  />
                  <text v-else class="member-avatar__fallback">
                    {{ m.nickname?.charAt(0) || '?' }}
                  </text>
                </view>
                <view class="min-w-0 flex-1">
                  <text class="member-card__name block text-sm text-tech font-medium">
                    {{ m.nickname }}
                  </text>
                  <text class="text-xs text-tech-muted">{{ getGuildRoleLabel(m.role) }}</text>
                </view>
              </view>
            </cyber-card>
          </view>
        </view>

        <view class="mt-3">
          <view v-if="!isLeader">
            <wd-button size="small" @click="emit('leave')">
              退出公会
            </wd-button>
          </view>
          <text v-else class="text-xs text-tech-subtle">会长不可直接退出</text>
        </view>
      </cyber-card>
    </view>
    <view v-else class="u-stack-4">
      <cyber-card class="cyber-card-pad-sm">
        <text class="guild-panel__heading">创建公会</text>
        <view class="u-gap-2 u-flex-row-center mt-2 flex flex-wrap">
          <view class="min-w-0 flex-1">
            <wd-input v-model="guildName" placeholder="公会名称" />
          </view>
          <view>
            <wd-button size="small" type="primary" @click="submitCreate">
              创建
            </wd-button>
          </view>
        </view>
      </cyber-card>

      <view>
        <text class="guild-panel__heading">加入公会</text>
        <view v-if="!guildList.length" class="guild-panel__empty mt-2">
          <text class="text-sm text-tech-subtle">暂无可加入的公会</text>
        </view>
        <view v-else class="u-stack-3 mt-2">
          <cyber-card v-for="g in guildList" :key="g.id" class="cyber-card-pad-sm">
            <view class="u-flex-row-center flex items-center justify-between">
              <view class="min-w-0 flex-1">
                <view class="u-gap-2 u-flex-row-center">
                  <text class="text-lg">⚔️</text>
                  <text class="text-sm text-tech-subtle">👥 {{ g.memberCount }}</text>
                </view>
                <text class="mt-1 block text-tech font-medium">{{ g.name }}</text>
                <text v-if="g.announcement" class="mt-1 block text-xs text-tech-muted">
                  {{ g.announcement }}
                </text>
              </view>
              <view class="ml-2 shrink-0">
                <wd-button size="small" @click="emit('join', g.id)">
                  加入公会
                </wd-button>
              </view>
            </view>
          </cyber-card>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.guild-panel__heading {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-text, rgba(255, 255, 255, 0.9));
}

.guild-panel__loading,
.guild-panel__empty {
  padding: 20px 0;
  text-align: center;
}

.guild-mine__count {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.member-avatar__img {
  width: 100%;
  height: 100%;
}

.member-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
}

.member-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

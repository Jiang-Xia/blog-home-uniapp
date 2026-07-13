<script lang="ts" setup>
/**
 * 公会面板（对齐 blog-home-nuxt GuildPanel）
 * 成员头像/昵称跳转 ROUTE_USER_PUBLIC
 */
import RpgPanelLoading from '@/components/rpg/rpg-panel-loading.vue'
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
    <RpgPanelLoading v-if="loading" />
    <view v-else-if="myGuild" class="rpg-loot-card rpg-loot-card--active guild-mine">
      <view class="rpg-loot-card-head">
        <text class="rpg-loot-name">{{ myGuild.name }}</text>
        <text class="rpg-loot-status rpg-loot-status--done">我的公会</text>
      </view>
      <text class="rpg-loot-desc">
        {{ myGuild.announcement || '暂无公告' }}
      </text>
      <text class="rpg-chip-tag">
        👥 {{ myGuild.memberCount ?? myGuild.members?.length ?? 0 }} 人
      </text>

      <view
        v-if="myGuild.members?.length"
        class="rpg-loot-grid rpg-loot-grid--compact member-grid"
      >
        <view
          v-for="m in myGuild.members"
          :key="m.uid"
          class="u-grid-2-item"
        >
          <view class="rpg-loot-card member-card" @click="goUserPublic(m.uid)">
            <view class="member-avatar">
              <image
                v-if="m.avatar"
                :src="resolveStaticUrl(m.avatar)"
                class="member-avatar__img"
                mode="aspectFill"
              />
              <text v-else class="member-avatar-fallback">
                {{ m.nickname?.charAt(0) || '?' }}
              </text>
            </view>
            <text class="rpg-loot-name">{{ m.nickname }}</text>
            <text class="rpg-loot-desc">{{ getGuildRoleLabel(m.role) }}</text>
          </view>
        </view>
      </view>

      <view class="rpg-loot-footer">
        <view
          v-if="!isLeader"
          class="rpg-loot-card-strip"
          @click="emit('leave')"
        >
          <text>退出公会</text>
        </view>
        <text v-else class="rpg-loot-status rpg-loot-status--pending guild-leader-hint">
          会长不可直接退出
        </text>
      </view>
    </view>

    <view v-else class="guild-panel__guest">
      <view class="rpg-loot-card">
        <text class="rpg-section-heading">创建公会</text>
        <view class="guild-create-row">
          <view class="guild-create-row__input">
            <wd-input v-model="guildName" placeholder="公会名称" />
          </view>
          <text class="rpg-loot-claim-btn" @click="submitCreate">创建</text>
        </view>
      </view>

      <view class="guild-panel__join">
        <text class="rpg-section-heading">加入公会</text>
        <view v-if="!guildList.length" class="rpg-empty-inline">
          <text>暂无可加入的公会</text>
        </view>
        <view v-else class="rpg-loot-grid">
          <view v-for="g in guildList" :key="g.id" class="u-grid-2-item">
            <view class="rpg-loot-card rpg-loot-card--stacked">
              <view class="rpg-loot-card-body">
                <view class="rpg-loot-card-head">
                  <view class="rpg-loot-icon">
                    <text class="rpg-loot-icon__emoji">⚔️</text>
                  </view>
                  <text class="rpg-chip-tag">👥 {{ g.memberCount }}</text>
                </view>
                <text class="rpg-loot-name">{{ g.name }}</text>
                <text v-if="g.announcement" class="rpg-loot-desc">{{ g.announcement }}</text>
              </view>
              <view
                class="rpg-loot-card-strip rpg-loot-card-strip--active"
                @click="emit('join', g.id)"
              >
                <text>加入公会</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.guild-panel__guest {
  display: flex;
  flex-direction: column;
}

.guild-panel__guest .rpg-loot-card {
  margin-bottom: 16px;
}

.guild-panel__join {
  margin-top: 0;
}

.guild-leader-hint {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
}

.member-grid {
  margin-top: 8px;
}
</style>

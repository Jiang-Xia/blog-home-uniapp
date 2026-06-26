<script lang="ts" setup>
import RpgAchievementPanel from '@/components/rpg/rpg-achievement-panel.vue'
import RpgAudioControl from '@/components/rpg/rpg-audio-control.vue'
import RpgBuffList from '@/components/rpg/rpg-buff-list.vue'
import RpgQuestPanel from '@/components/rpg/rpg-quest-panel.vue'
import RpgStatusPanel from '@/components/rpg/rpg-status-panel.vue'
import { useRpgPage } from '@/composables/use-rpg-page'
import { useTokenStore } from '@/store/token'
import {
  formatLeaderboardScore,
  RPG_LEADERBOARD_TYPE_TABS,
  rpgItemDisplayName,

} from '@/utils/rpg-display'
import type { RpgLeaderboardScoreType } from '@/utils/rpg-display'

definePage({
  style: { navigationBarTitleText: '冒险中心' },
})

const tokenStore = useTokenStore()
const rpg = useRpgPage()
const {
  activeTab,
  status,
  signInfo,
  banStatus,
  quests,
  achievements,
  buffs,
  lotteryTickets,
  inventory,
  loadout,
  pets,
  petCatalog,
  guild,
  guildList,
  leaderboard,
  leaderboardType,
  loading,
  signingIn,
  drawing,
  showLevelUp,
  levelUpLevel,
  loadTab,
  init,
  signIn,
  claimQuest,
  drawLottery,
  toggleBuff,
  equipItem,
  unequipItem,
  hatchPet,
  doJoinGuild,
  doLeaveGuild,
  recharge,
  switchTab,
} = rpg

const tabs = [
  { key: 'status', label: '状态' },
  { key: 'inventory', label: '背包' },
  { key: 'pet', label: '宠物' },
  { key: 'guild', label: '公会' },
  { key: 'leaderboard', label: '排行' },
] as const

const leaderboardTypeTabs = RPG_LEADERBOARD_TYPE_TABS

function inventoryEquipSlot(item: any): string | null {
  const type = item.config?.itemType
  if (type === 'title')
    return 'title'
  if (type === 'avatar_frame')
    return 'avatar_frame'
  return item.slot ?? null
}

function isInventoryEquipped(item: any) {
  if (!loadout.value)
    return false
  const code = item.itemCode || item.code
  if (item.config?.itemType === 'title')
    return loadout.value.titleCode === code
  if (item.config?.itemType === 'avatar_frame')
    return loadout.value.avatarFrameCode === code
  return !!item.equipped
}
const guildJoinId = ref('')
const petEggCode = ref('')
let cleanup: (() => void) | null = null

onLoad(() => {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  cleanup = init()
  void loadTab()
})

onUnload(() => {
  cleanup?.()
})
</script>

<template>
  <view class="rpg-page cyber-page-grid">
    <view class="cyber-tabs flex items-center justify-between px-3 py-2">
      <scroll-view scroll-x class="tabs flex-1">
        <view class="flex">
          <text
            v-for="tab in tabs"
            :key="tab.key"
            class="cyber-tab mr-3 shrink-0"
            :class="activeTab === tab.key ? 'cyber-tab-active' : ''"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </text>
        </view>
      </scroll-view>
      <RpgAudioControl />
    </view>

    <view v-if="loading" class="p-8 text-center text-tech-subtle">
      加载中...
    </view>

    <view v-else-if="activeTab === 'status' && status" class="p-4">
      <RpgStatusPanel
        :status="status"
        :sign-info="signInfo"
        :ban-status="banStatus"
        :signing-in="signingIn"
        @sign-in="signIn"
      />
      <view class="u-gap-2 mt-4 flex flex-wrap">
        <wd-button size="small" :loading="drawing" @click="drawLottery">
          抽奖 · 券 {{ lotteryTickets }}
        </wd-button>
      </view>
      <RpgQuestPanel :quests="quests" @claim="claimQuest" />
      <RpgAchievementPanel :achievements="achievements" />
      <RpgBuffList :buffs="buffs" @toggle="toggleBuff" />
      <cyber-card class="cyber-card-pad-sm mt-4">
        <text class="mb-2 block text-tech font-medium">充值</text>
        <wd-input v-model="rechargeAmount" type="number" label="金额(元)" />
        <wd-button size="small" class="mt-2" @click="recharge(Number(rechargeAmount))">
          充值钻石
        </wd-button>
      </cyber-card>
    </view>

    <view v-else-if="activeTab === 'inventory'" class="p-3">
      <cyber-card v-if="loadout" class="cyber-card-pad-sm mb-3">
        <text class="block text-tech font-medium">当前装备</text>
        <text v-if="loadout.title" class="mt-1 block text-xs text-tech-muted">
          称号：{{ loadout.title.name }}
        </text>
        <text v-if="loadout.avatarFrame" class="mt-1 block text-xs text-tech-muted">
          头像框：{{ loadout.avatarFrame.name }}
        </text>
        <text v-if="loadout.pet" class="mt-1 block text-xs text-tech-muted">
          宠物：{{ loadout.pet.nickname || loadout.pet.name }}
        </text>
        <text v-if="!loadout.title && !loadout.avatarFrame && !loadout.pet" class="mt-1 block text-xs text-tech-subtle">
          暂无穿戴
        </text>
      </cyber-card>
      <cyber-card v-for="item in inventory" :key="item.id || item.code || item.itemCode" class="cyber-card-pad-sm mb-2">
        <view class="flex items-center justify-between">
          <view class="min-w-0 flex-1">
            <text class="text-tech font-medium">{{ rpgItemDisplayName(item) }}</text>
            <view v-if="item.config?.itemTypeLabel || item.config?.rarityLabel" class="u-gap-2 mt-1 flex flex-wrap">
              <text v-if="item.config?.itemTypeLabel" class="text-xs text-tech-subtle">
                {{ item.config.itemTypeLabel }}
              </text>
              <text
                v-if="item.config?.rarityLabel"
                class="text-xs"
                :style="item.config?.rarityColor ? { color: item.config.rarityColor } : undefined"
              >
                {{ item.config.rarityLabel }}
              </text>
            </view>
            <text v-if="item.sourceLabel" class="text-tech-faint mt-1 block text-xs">{{ item.sourceLabel }}</text>
          </view>
          <text class="ml-2 shrink-0 text-xs text-tech-subtle">x{{ item.quantity ?? 1 }}</text>
        </view>
        <wd-button
          v-if="inventoryEquipSlot(item)"
          size="small"
          class="mt-2"
          @click="isInventoryEquipped(item) ? unequipItem(inventoryEquipSlot(item)!) : equipItem(inventoryEquipSlot(item)!, item.itemCode || item.code)"
        >
          {{ isInventoryEquipped(item) ? '卸下' : '装备' }}
        </wd-button>
      </cyber-card>
      <view v-if="!inventory.length" class="py-8 text-center text-tech-subtle">
        背包为空
      </view>
    </view>

    <view v-else-if="activeTab === 'pet'" class="p-3">
      <cyber-card class="cyber-card-pad-sm mb-3">
        <wd-input v-model="petEggCode" label="宠物蛋 code" placeholder="itemCode" />
        <wd-button size="small" class="mt-2" @click="petEggCode && hatchPet(petEggCode)">
          孵化
        </wd-button>
      </cyber-card>
      <cyber-card v-for="pet in pets" :key="pet.id" class="cyber-card-pad-sm mb-2">
        <text class="text-tech font-medium">{{ pet.nickname || pet.config?.name || pet.name }}</text>
        <text class="ml-2 text-xs text-tech-subtle">Lv.{{ pet.level ?? 1 }}</text>
      </cyber-card>
      <view v-if="petCatalog.length" class="mt-4">
        <text class="mb-2 block text-sm text-tech-subtle">图鉴</text>
        <text v-for="p in petCatalog" :key="p.code" class="mr-2 text-xs text-tech-muted">{{ p.config?.name || p.name }}</text>
      </view>
    </view>

    <view v-else-if="activeTab === 'guild'" class="p-4">
      <cyber-card v-if="guild" class="mb-4">
        <text class="block text-lg text-tech font-bold">{{ guild.name }}</text>
        <text class="mt-2 block text-sm text-tech-muted">{{ guild.announcement }}</text>
        <wd-button size="small" class="mt-3" @click="doLeaveGuild">
          退出公会
        </wd-button>
      </cyber-card>
      <view v-else>
        <cyber-card v-for="g in guildList" :key="g.id" class="cyber-card-pad-sm mb-2">
          <view class="cyber-card-row">
            <text class="text-tech">{{ g.name }}</text>
            <wd-button size="small" @click="doJoinGuild(g.id)">
              加入
            </wd-button>
          </view>
        </cyber-card>
        <view v-if="!guildList.length" class="py-8 text-center text-tech-subtle">
          暂无公会列表
        </view>
      </view>
    </view>

    <view v-else-if="activeTab === 'leaderboard'" class="p-3">
      <view class="u-gap-2 mb-3 flex flex-wrap">
        <wd-button
          v-for="tab in leaderboardTypeTabs"
          :key="tab.key"
          size="small"
          :type="leaderboardType === tab.key ? 'primary' : undefined"
          @click="leaderboardType = tab.key; loadTab(true)"
        >
          {{ tab.label }}
        </wd-button>
      </view>
      <cyber-card v-for="(row, idx) in leaderboard" :key="row.uid || idx" class="cyber-card-pad-sm mb-2">
        <view class="u-flex-row-center u-gap-3">
          <text class="w-6 shrink-0 text-center text-tech-subtle font-bold">{{ idx + 1 }}</text>
          <text class="u-flex-1 text-tech">{{ row.nickname }}</text>
          <text class="shrink-0 text-sm text-tech-primary">{{ formatLeaderboardScore(row, leaderboardType as RpgLeaderboardScoreType) }}</text>
        </view>
      </cyber-card>
    </view>

    <view v-if="showLevelUp" class="level-up-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center" @click="showLevelUp = false">
      <cyber-card class="cyber-card-pad-xl text-center" @click.stop>
        <text class="block text-4xl">🎉</text>
        <text class="mt-2 block text-xl text-tech font-bold">升级！</text>
        <text class="mt-1 block text-tech-muted">Lv.{{ levelUpLevel }}</text>
      </cyber-card>
    </view>
  </view>
</template>

<style scoped>
.rpg-page {
  min-height: 100vh;
}

/* #ifdef MP-WEIXIN || MP-ALIPAY */
.rpg-page {
  min-height: 100%;
}
/* #endif */
.tabs {
  white-space: nowrap;
}
.level-up-overlay {
  position: fixed;
}
</style>

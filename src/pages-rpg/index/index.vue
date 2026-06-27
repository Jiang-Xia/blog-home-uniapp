<script lang="ts" setup>
/**
 * 冒险中心主页面壳（五 Tab + 面板组件，对齐 blog-home-nuxt pages/rpg/index.vue）
 */
import RpgAchievementPanel from '@/components/rpg/rpg-achievement-panel.vue'
import RpgAudioControl from '@/components/rpg/rpg-audio-control.vue'
import RpgBuffList from '@/components/rpg/rpg-buff-list.vue'
import RpgGuildPanel from '@/components/rpg/rpg-guild-panel.vue'
import RpgHitRecords from '@/components/rpg/rpg-hit-records.vue'
import RpgInventoryPanel from '@/components/rpg/rpg-inventory-panel.vue'
import RpgLeaderboardPanel from '@/components/rpg/rpg-leaderboard-panel.vue'
import RpgLevelRewardsPanel from '@/components/rpg/rpg-level-rewards-panel.vue'
import RpgLevelUpAnimation from '@/components/rpg/rpg-level-up-animation.vue'
import RpgLotteryBox from '@/components/rpg/rpg-lottery-box.vue'
import RpgPanelLoading from '@/components/rpg/rpg-panel-loading.vue'
import RpgPetPanel from '@/components/rpg/rpg-pet-panel.vue'
import RpgQuestPanel from '@/components/rpg/rpg-quest-panel.vue'
import RpgRechargeModal from '@/components/rpg/rpg-recharge-modal.vue'
import RpgSeasonBanner from '@/components/rpg/rpg-season-banner.vue'
import RpgStatusPanel from '@/components/rpg/rpg-status-panel.vue'
import { useRpgPage } from '@/composables/use-rpg-page'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { useRpgRecharge } from '@/composables/use-rpg-recharge'
import { useTokenStore } from '@/store/token'
import type { DrawResult } from '@/types/rpg'

definePage({
  style: { navigationBarTitleText: '冒险中心' },
})

const tokenStore = useTokenStore()
const { initAudio, playBgm, stopBgm, muted, bgmVolume } = useRpgAudio()
const { openRechargeModal } = useRpgRecharge()

const {
  activeTab,
  rpgStatus,
  signInfo,
  banStatus,
  achievements,
  questGroups,
  buffs,
  levelRewards,
  lotteryPool,
  lotteryTickets,
  lotteryHistory,
  hitRecords,
  hitRecordsTotal,
  activityOverview,
  weatherBuff,
  inventoryItems,
  loadout,
  pets,
  petEggs,
  petCatalog,
  equippedPetId,
  myGuild,
  guildList,
  leaderboard,
  statusLoading,
  inventoryLoading,
  petLoading,
  guildLoading,
  leaderboardLoading,
  signingIn,
  drawing,
  showLevelUp,
  levelUpData,
  leaderboardType,
  leaderboardPeriod,
  loadTab,
  loadHitRecords,
  loadLotteryHistory,
  signIn,
  claimQuest,
  handleDraw,
  beginLotteryDrawSession,
  refreshAfterDraw,
  toggleBuff,
  equipItem,
  unequipItem,
  hatchPet,
  doBuyPet,
  doDeployPet,
  doRestPet,
  doRenamePet,
  doCreateGuild,
  doJoinGuild,
  doLeaveGuild,
  switchTab,
  init,
} = useRpgPage()

const lotteryBoxRef = ref<InstanceType<typeof RpgLotteryBox> | null>(null)
const hitRecordsLoading = ref(false)

const tabs = [
  { key: 'status', label: '状态' },
  { key: 'inventory', label: '背包' },
  { key: 'pet', label: '宠物' },
  { key: 'guild', label: '公会' },
  { key: 'leaderboard', label: '排行' },
] as const

let cleanup: (() => void) | null = null

onLoad((options) => {
  if (!tokenStore.hasLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  const tab = options?.tab as string | undefined
  if (tab === 'inventory' || tab === 'pet' || tab === 'guild' || tab === 'leaderboard')
    activeTab.value = tab
  cleanup = init()
  void initAudio()
  void loadTab()
})

onUnload(() => {
  cleanup?.()
  stopBgm()
})

watch([bgmVolume, muted], ([vol, isMuted]) => {
  if (!isMuted && vol > 0)
    playBgm('adventure')
  else
    stopBgm()
})

watch([leaderboardType, leaderboardPeriod], () => {
  if (activeTab.value === 'leaderboard')
    void loadTab(true)
})

async function onDraw(count: number, currency: 'ticket' | 'currency') {
  beginLotteryDrawSession()
  try {
    const results = await handleDraw(count, currency)
    lotteryBoxRef.value?.showDrawResults(results)
  }
  catch (e: any) {
    lotteryBoxRef.value?.cancelDrawAnimation()
    uni.showToast({ title: e?.message || '抽奖失败', icon: 'none' })
  }
}

function onDrawFinished(results: DrawResult[]) {
  void refreshAfterDraw(results)
}

async function onLoadHitRecords() {
  hitRecordsLoading.value = true
  try {
    await loadHitRecords()
  }
  finally {
    hitRecordsLoading.value = false
  }
}
</script>

<template>
  <view class="rpg-page cyber-page-grid u-page-scroll">
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
      <RpgAudioControl show-volume />
    </view>

    <view v-if="activeTab === 'status'" class="p-4">
      <RpgPanelLoading v-if="statusLoading" />
      <template v-else-if="rpgStatus">
        <RpgSeasonBanner
          :activity-overview="activityOverview"
          :weather-buff="weatherBuff"
        />
        <RpgStatusPanel
          :status="rpgStatus"
          :sign-info="signInfo"
          :ban-status="banStatus"
          :signing-in="signingIn"
          @sign-in="signIn()"
        />
        <RpgLotteryBox
          ref="lotteryBoxRef"
          :lottery-pool="lotteryPool"
          :lottery-tickets="lotteryTickets"
          :rpg-status="rpgStatus"
          :lottery-history="lotteryHistory"
          :drawing="drawing"
          @draw="onDraw"
          @load-history="loadLotteryHistory()"
          @finished="onDrawFinished"
        />
        <RpgLevelRewardsPanel
          :level-rewards="levelRewards"
          :current-level="rpgStatus.level"
        />
        <RpgQuestPanel
          :quest-groups="questGroups"
          @claim="claimQuest"
        />
        <RpgAchievementPanel :achievements="achievements" />
        <RpgBuffList :buffs="buffs" @toggle="toggleBuff" />
        <RpgHitRecords
          :records="hitRecords"
          :total="hitRecordsTotal"
          :loading="hitRecordsLoading"
          @load="onLoadHitRecords"
        />
      </template>
    </view>

    <view v-else-if="activeTab === 'inventory'" class="p-3">
      <RpgInventoryPanel
        :items="inventoryItems"
        :loadout="loadout"
        :loading="inventoryLoading"
        @equip="(slot, code) => equipItem(slot, code)"
        @unequip="slot => unequipItem(slot)"
        @recharge="openRechargeModal()"
      />
    </view>

    <view v-else-if="activeTab === 'pet'" class="p-3">
      <RpgPetPanel
        :pets="pets"
        :eggs="petEggs"
        :catalog="petCatalog"
        :equipped-pet-id="equippedPetId"
        :loading="petLoading"
        @hatch="hatchPet"
        @buy="doBuyPet"
        @deploy="doDeployPet"
        @rest="doRestPet"
        @rename="(id, name) => doRenamePet(id, name)"
      />
    </view>

    <view v-else-if="activeTab === 'guild'" class="p-3">
      <RpgGuildPanel
        :my-guild="myGuild"
        :guild-list="guildList"
        :loading="guildLoading"
        @create="doCreateGuild"
        @join="doJoinGuild"
        @leave="doLeaveGuild"
      />
    </view>

    <view v-else-if="activeTab === 'leaderboard'" class="p-3">
      <RpgLeaderboardPanel
        v-model:active-type="leaderboardType"
        v-model:active-period="leaderboardPeriod"
        :leaderboard="leaderboard"
        :loading="leaderboardLoading"
      />
    </view>

    <RpgLevelUpAnimation
      :visible="showLevelUp"
      :level-up-data="levelUpData"
      @close="showLevelUp = false"
    />

    <RpgRechargeModal />
  </view>
</template>

<style lang="scss">
@import '@/style/rpg-theme.scss';
</style>

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
</style>

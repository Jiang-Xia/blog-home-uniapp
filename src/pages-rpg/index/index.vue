<script lang="ts" setup>
import RpgAchievementPanel from '@/components/rpg/rpg-achievement-panel.vue'
import RpgAudioControl from '@/components/rpg/rpg-audio-control.vue'
import RpgBuffList from '@/components/rpg/rpg-buff-list.vue'
import RpgQuestPanel from '@/components/rpg/rpg-quest-panel.vue'
import RpgStatusPanel from '@/components/rpg/rpg-status-panel.vue'
import { useRpgPage } from '@/composables/use-rpg-page'
import { useTokenStore } from '@/store/token'

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

const rechargeAmount = ref(6)
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
  <view class="rpg-page">
    <view class="flex items-center justify-between bg-white px-3 py-2">
      <scroll-view scroll-x class="tabs flex-1">
        <view class="flex">
          <text
            v-for="tab in tabs"
            :key="tab.key"
            class="mr-3 shrink-0 px-2 py-1 text-sm"
            :class="activeTab === tab.key ? 'font-bold text-blue-600' : 'text-gray-500'"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </text>
        </view>
      </scroll-view>
      <RpgAudioControl />
    </view>

    <view v-if="loading" class="p-8 text-center text-gray-400">
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
      <view class="mt-4 flex flex-wrap gap-2">
        <wd-button size="small" :loading="drawing" @click="drawLottery">
          抽奖 · 券 {{ lotteryTickets }}
        </wd-button>
      </view>
      <RpgQuestPanel :quests="quests" @claim="claimQuest" />
      <RpgAchievementPanel :achievements="achievements" />
      <RpgBuffList :buffs="buffs" @toggle="toggleBuff" />
      <view class="mt-4 rounded-lg bg-white p-3 shadow-sm">
        <text class="mb-2 block font-medium">充值</text>
        <wd-input v-model="rechargeAmount" type="number" label="金额(元)" />
        <wd-button size="small" class="mt-2" @click="recharge(Number(rechargeAmount))">
          充值钻石
        </wd-button>
      </view>
    </view>

    <view v-else-if="activeTab === 'inventory'" class="p-3">
      <view v-if="loadout" class="mb-3 rounded bg-blue-50 p-3 text-xs">
        <text class="block font-medium">当前装备</text>
        <text v-for="(v, k) in loadout" :key="k" class="mt-1 block">{{ k }}: {{ v?.name || '—' }}</text>
      </view>
      <view v-for="item in inventory" :key="item.id || item.code" class="mb-2 rounded bg-white p-3 shadow-sm">
        <view class="flex items-center justify-between">
          <text class="font-medium">{{ item.name }}</text>
          <text class="text-xs text-gray-500">x{{ item.quantity ?? 1 }}</text>
        </view>
        <wd-button v-if="item.slot" size="small" class="mt-2" @click="equipItem(item.slot, item.code)">
          装备
        </wd-button>
        <wd-button v-if="item.equipped" size="small" class="mt-2" @click="unequipItem(item.slot)">
          卸下
        </wd-button>
      </view>
      <view v-if="!inventory.length" class="py-8 text-center text-gray-400">
        背包为空
      </view>
    </view>

    <view v-else-if="activeTab === 'pet'" class="p-3">
      <view class="mb-3 rounded bg-white p-3 shadow-sm">
        <wd-input v-model="petEggCode" label="宠物蛋 code" placeholder="itemCode" />
        <wd-button size="small" class="mt-2" @click="petEggCode && hatchPet(petEggCode)">
          孵化
        </wd-button>
      </view>
      <view v-for="pet in pets" :key="pet.id" class="mb-2 rounded bg-white p-3 shadow-sm">
        <text class="font-medium">{{ pet.nickname || pet.name }}</text>
        <text class="ml-2 text-xs text-gray-500">Lv.{{ pet.level ?? 1 }}</text>
      </view>
      <view v-if="petCatalog.length" class="mt-4">
        <text class="mb-2 block text-sm text-gray-500">图鉴</text>
        <text v-for="p in petCatalog" :key="p.code" class="mr-2 text-xs">{{ p.name }}</text>
      </view>
    </view>

    <view v-else-if="activeTab === 'guild'" class="p-4">
      <view v-if="guild" class="rounded bg-white p-4 shadow-sm">
        <text class="block text-lg font-bold">{{ guild.name }}</text>
        <text class="mt-2 block text-sm text-gray-600">{{ guild.announcement }}</text>
        <wd-button size="small" class="mt-3" @click="doLeaveGuild">
          退出公会
        </wd-button>
      </view>
      <view v-else>
        <view v-for="g in guildList" :key="g.id" class="mb-2 flex items-center justify-between rounded bg-white p-3 shadow-sm">
          <text>{{ g.name }}</text>
          <wd-button size="small" @click="doJoinGuild(g.id)">
            加入
          </wd-button>
        </view>
        <view v-if="!guildList.length" class="py-8 text-center text-gray-400">
          暂无公会列表
        </view>
      </view>
    </view>

    <view v-else-if="activeTab === 'leaderboard'" class="p-3">
      <view class="mb-3 flex gap-2">
        <wd-button
          v-for="t in ['exp', 'level', 'reputation', 'currency']"
          :key="t"
          size="small"
          :type="leaderboardType === t ? 'primary' : undefined"
          @click="leaderboardType = t as any; loadTab(true)"
        >
          {{ t }}
        </wd-button>
      </view>
      <view v-for="(row, idx) in leaderboard" :key="row.uid || idx" class="mb-2 flex items-center gap-3 rounded bg-white p-3 shadow-sm">
        <text class="w-6 text-center text-gray-400 font-bold">{{ idx + 1 }}</text>
        <text class="flex-1">{{ row.nickname }}</text>
        <text class="text-sm text-blue-600">{{ row.score ?? row.exp ?? row.level }}</text>
      </view>
    </view>

    <view v-if="showLevelUp" class="level-up-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click="showLevelUp = false">
      <view class="rounded-xl bg-white p-8 text-center" @click.stop>
        <text class="block text-4xl">🎉</text>
        <text class="mt-2 block text-xl font-bold">升级！</text>
        <text class="mt-1 block text-gray-600">Lv.{{ levelUpLevel }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.rpg-page {
  min-height: 100vh;
  background: #f0f2f5;
}
.tabs {
  white-space: nowrap;
}
.level-up-overlay {
  position: fixed;
}
</style>

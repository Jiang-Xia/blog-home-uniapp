<script lang="ts" setup>
/**
 * 全站 RPG 初始化：登录后拉取共享状态、连接 WS、挂载庆祝动画
 */
import RpgAchievementAnimation from '@/components/rpg/rpg-achievement-animation.vue'
import RpgActivityStartBanner from '@/components/rpg/rpg-activity-start-banner.vue'
import RpgBanPunishAnimation from '@/components/rpg/rpg-ban-punish-animation.vue'
import RpgCurrencyGainFx from '@/components/rpg/rpg-currency-gain-fx.vue'
import RpgItemRevealAnimation from '@/components/rpg/rpg-item-reveal-animation.vue'
import RpgLevelUpAnimation from '@/components/rpg/rpg-level-up-animation.vue'
import RpgPetHatchAnimation from '@/components/rpg/rpg-pet-hatch-animation.vue'
import RpgQuestCompleteBadge from '@/components/rpg/rpg-quest-complete-badge.vue'
import RpgQuestRewardAnimation from '@/components/rpg/rpg-quest-reward-animation.vue'
import RpgRankChangeAnimation from '@/components/rpg/rpg-rank-change-animation.vue'
import RpgRechargeModal from '@/components/rpg/rpg-recharge-modal.vue'
import RpgScreenPulseFx from '@/components/rpg/rpg-screen-pulse-fx.vue'
import RpgSocialFeedbackAnimation from '@/components/rpg/rpg-social-feedback-animation.vue'
import { useRpg } from '@/composables/use-rpg'
import { rpgAnimationState, useRpgRealtimeHandlers } from '@/composables/use-rpg-realtime-handlers'
import { connectRealtimeSocket, disconnectRealtimeSocket } from '@/composables/use-realtime-socket'
import { useTokenStore } from '@/store/token'

const tokenStore = useTokenStore()
const { initCore } = useRpg()
const s = rpgAnimationState
let handlersInstalled = false

watch(
  () => tokenStore.hasLogin,
  (loggedIn) => {
    if (loggedIn) {
      connectRealtimeSocket()
      if (!handlersInstalled) {
        useRpgRealtimeHandlers()
        handlersInstalled = true
      }
      void initCore()
    }
    else {
      disconnectRealtimeSocket()
    }
  },
  { immediate: true },
)
</script>

<template>
  <view v-if="tokenStore.hasLogin" class="rpg-global-init">
    <RpgLevelUpAnimation
      :visible="s.levelUpVisible.value"
      :level-up-data="s.levelUpData.value"
      @close="s.levelUpVisible.value = false"
    />
    <RpgAchievementAnimation
      :visible="s.achievementVisible.value"
      :name="s.achievementName.value"
      :exp-reward="s.achievementExpReward.value"
      :rarity-color="s.achievementRarityColor.value"
      :rarity-label="s.achievementRarityLabel.value"
      @close="s.achievementVisible.value = false"
    />
    <RpgQuestRewardAnimation
      :visible="s.questRewardVisible.value"
      :quest-name="s.questRewardName.value"
      :exp-reward="s.questRewardExp.value"
      @close="s.questRewardVisible.value = false"
    />
    <RpgQuestCompleteBadge
      :visible="s.questCompleteVisible.value"
      :quest-name="s.questCompleteName.value"
      @close="s.questCompleteVisible.value = false"
    />
    <RpgPetHatchAnimation
      :visible="s.petHatchVisible.value"
      :pet-name="s.petHatchName.value"
      @close="s.petHatchVisible.value = false"
    />
    <RpgItemRevealAnimation
      :visible="s.itemRevealVisible.value"
      :item="{ name: s.itemRevealName.value, rarityLabel: s.itemRevealRarityLabel.value }"
      @close="s.itemRevealVisible.value = false"
    />
    <RpgRankChangeAnimation
      :visible="s.rankChangeVisible.value"
      :rank="s.rankChangeRank.value"
      :type-label="s.rankChangeTypeLabel.value"
      :period-label="s.rankChangePeriodLabel.value"
      @close="s.rankChangeVisible.value = false"
    />
    <RpgSocialFeedbackAnimation
      :visible="s.socialFeedbackVisible.value"
      :feedback="s.socialFeedbackData.value"
      @close="s.socialFeedbackVisible.value = false"
    />
    <RpgScreenPulseFx
      :visible="s.screenPulseVisible.value"
      :kind="s.screenPulseKind.value"
      :label="s.screenPulseLabel.value"
      @done="s.screenPulseVisible.value = false"
    />
    <RpgCurrencyGainFx
      :visible="s.currencyGainVisible.value"
      :amount="s.currencyGainAmount.value"
      :reason="s.currencyGainReason.value"
      @done="s.currencyGainVisible.value = false"
    />
    <RpgActivityStartBanner
      :visible="s.activityBannerVisible.value"
      :activity-name="s.activityBannerName.value"
      @close="s.activityBannerVisible.value = false"
    />
    <RpgBanPunishAnimation
      :visible="s.banPunishVisible.value"
      @close="s.banPunishVisible.value = false"
    />
    <RpgRechargeModal />
  </view>
</template>

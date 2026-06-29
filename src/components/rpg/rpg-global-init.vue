<script lang="ts" setup>
/**
 * 全站 RPG 初始化：登录后拉取共享状态、连接 WS、挂载庆祝动画
 */
import RpgAchievementAnimation from '@/components/rpg/rpg-achievement-animation.vue'
import RpgActivityStartBanner from '@/components/rpg/rpg-activity-start-banner.vue'
import RpgArticleLevelUpBadge from '@/components/rpg/rpg-article-level-up-badge.vue'
import RpgBanPunishAnimation from '@/components/rpg/rpg-ban-punish-animation.vue'
import RpgCurrencyGainFx from '@/components/rpg/rpg-currency-gain-fx.vue'
import RpgItemRevealAnimation from '@/components/rpg/rpg-item-reveal-animation.vue'
import RpgLevelUpAnimation from '@/components/rpg/rpg-level-up-animation.vue'
import RpgMasterpieceAnimation from '@/components/rpg/rpg-masterpiece-animation.vue'
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
import { useSiteNotification } from '@/composables/use-site-notification'
import { useTokenStore } from '@/store/token'

// #ifdef MP-WEIXIN
defineOptions({
  options: {
    virtualHost: true,
  },
})
// #endif

const tokenStore = useTokenStore()
const { initCore } = useRpg()
const {
  levelUpVisible,
  levelUpData,
  achievementVisible,
  achievementName,
  achievementExpReward,
  achievementRarityColor,
  achievementRarityLabel,
  achievementRarityIcon,
  masterpieceVisible,
  masterpieceTitle,
  articleLevelUpVisible,
  articleLevelUpData,
  questRewardVisible,
  questRewardName,
  questRewardExp,
  questCompleteVisible,
  questCompleteName,
  petHatchVisible,
  petHatchName,
  itemRevealVisible,
  itemRevealData,
  rankChangeVisible,
  rankChangeRank,
  rankChangeTypeLabel,
  rankChangePeriodLabel,
  socialFeedbackVisible,
  socialFeedbackData,
  screenPulseVisible,
  screenPulseKind,
  screenPulseLabel,
  currencyGainVisible,
  currencyGainAmount,
  currencyGainReason,
  activityBannerVisible,
  activityBannerName,
  activityBannerSubtitle,
  banPunishVisible,
} = rpgAnimationState
let handlersInstalled = false

useSiteNotification()

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
      :visible="levelUpVisible"
      :level-up-data="levelUpData"
      @close="levelUpVisible = false"
    />
    <RpgAchievementAnimation
      :visible="achievementVisible"
      :name="achievementName"
      :exp-reward="achievementExpReward"
      :rarity-color="achievementRarityColor"
      :rarity-label="achievementRarityLabel"
      :rarity-icon="achievementRarityIcon"
      @close="achievementVisible = false"
    />
    <RpgMasterpieceAnimation
      :visible="masterpieceVisible"
      :article-title="masterpieceTitle"
      @close="masterpieceVisible = false"
    />
    <RpgArticleLevelUpBadge
      :visible="articleLevelUpVisible"
      :data="articleLevelUpData"
      @close="articleLevelUpVisible = false"
    />
    <RpgQuestRewardAnimation
      :visible="questRewardVisible"
      :quest-name="questRewardName"
      :exp-reward="questRewardExp"
      @close="questRewardVisible = false"
    />
    <RpgQuestCompleteBadge
      :visible="questCompleteVisible"
      :quest-name="questCompleteName"
      @close="questCompleteVisible = false"
    />
    <RpgPetHatchAnimation
      :visible="petHatchVisible"
      :pet-name="petHatchName"
      @close="petHatchVisible = false"
    />
    <RpgItemRevealAnimation
      :visible="itemRevealVisible"
      :item="itemRevealData"
      @close="itemRevealVisible = false"
    />
    <RpgRankChangeAnimation
      :visible="rankChangeVisible"
      :rank="rankChangeRank"
      :type-label="rankChangeTypeLabel"
      :period-label="rankChangePeriodLabel"
      @close="rankChangeVisible = false"
    />
    <RpgSocialFeedbackAnimation
      :visible="socialFeedbackVisible"
      :feedback="socialFeedbackData"
      @close="socialFeedbackVisible = false"
    />
    <RpgScreenPulseFx
      :visible="screenPulseVisible"
      :kind="screenPulseKind"
      :label="screenPulseLabel"
      @done="screenPulseVisible = false"
    />
    <RpgCurrencyGainFx
      :visible="currencyGainVisible"
      :amount="currencyGainAmount"
      :reason="currencyGainReason"
      @done="currencyGainVisible = false"
    />
    <RpgActivityStartBanner
      :visible="activityBannerVisible"
      :activity-name="activityBannerName"
      :subtitle="activityBannerSubtitle"
      @close="activityBannerVisible = false"
    />
    <RpgBanPunishAnimation
      :visible="banPunishVisible"
      @close="banPunishVisible = false"
    />
    <RpgRechargeModal />
  </view>
</template>

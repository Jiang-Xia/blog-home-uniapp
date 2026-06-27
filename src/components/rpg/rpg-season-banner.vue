<script lang="ts" setup>
/**
 * 赛季/限时活动 Banner（对齐 blog-home-nuxt SeasonBanner，MP 简化版）
 * 展示 activityOverview 与 weatherBuff；多活动用 swiper 轮播，海报大图 uni.previewImage
 */
import type { CurrentActivitiesOverview, RpgActivitySummary } from '@/types/rpg'
import { resolveStaticUrl } from '@/utils/static-url'
import { useRpgAudio } from '@/composables/use-rpg-audio'

const props = defineProps<{
  activityOverview: CurrentActivitiesOverview | null
  weatherBuff: any
}>()

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  season: '赛季',
  festival: '节日',
  event: '限时',
}

const { playSfx } = useRpgAudio()
const activeIndex = ref(0)

const effectiveExpBuffRate = computed(() => props.activityOverview?.effectiveExpBuffRate ?? 1)

/** 合并赛季 + 限时，赛季在前 */
const activityCards = computed<RpgActivitySummary[]>(() => {
  const overview = props.activityOverview
  if (!overview)
    return []
  const list: RpgActivitySummary[] = []
  if (overview.season)
    list.push(overview.season)
  list.push(...overview.limitedTime)
  return list
})

const hasMultiple = computed(() => activityCards.value.length > 1)
const activeActivity = computed(() => activityCards.value[activeIndex.value] ?? null)

watch(activityCards, (list) => {
  if (activeIndex.value >= list.length)
    activeIndex.value = 0
})

function activityTypeLabel(type: string) {
  return ACTIVITY_TYPE_LABELS[type] || '活动'
}

function resolvePosterUrl(url: string) {
  if (!url)
    return ''
  return resolveStaticUrl(url)
}

function onSwiperChange(e: { detail: { current: number } }) {
  activeIndex.value = e.detail.current
}

function selectActivity(index: number) {
  if (index === activeIndex.value)
    return
  activeIndex.value = index
  void playSfx('uiClick')
}

/** 预览活动海报大图 */
function previewPoster(activity: RpgActivitySummary) {
  const url = resolvePosterUrl(activity.posterUrl)
  if (!url)
    return
  uni.previewImage({ urls: [url], current: url })
}
</script>

<template>
  <view v-if="activeActivity" class="season-banner">
    <!-- HUD：加成来源一览 -->
    <view class="season-banner__hud u-gap-2 u-flex-row-center flex flex-wrap">
      <text class="season-banner__hud-label">活动加成</text>
      <view class="u-gap-2 flex flex-wrap">
        <text v-if="weatherBuff" class="season-banner__pill season-banner__pill--weather">
          🌤 {{ weatherBuff.label }}
        </text>
        <text class="season-banner__pill season-banner__pill--effective">
          经验 ×{{ effectiveExpBuffRate }} 生效中
        </text>
      </view>
    </view>

    <!-- 主视觉轮播 -->
    <swiper
      class="season-banner__swiper"
      :current="activeIndex"
      :indicator-dots="hasMultiple"
      indicator-color="rgba(255,255,255,0.35)"
      indicator-active-color="rgba(255,255,255,0.9)"
      @change="onSwiperChange"
    >
      <swiper-item
        v-for="activity in activityCards"
        :key="activity.code"
      >
        <view
          class="season-banner__slide"
          :class="[
            activity.activityType === 'season' ? 'season-banner__slide--season' : 'season-banner__slide--limited',
            resolvePosterUrl(activity.posterUrl) ? 'season-banner__slide--poster' : '',
          ]"
        >
          <image
            v-if="resolvePosterUrl(activity.posterUrl)"
            :src="resolvePosterUrl(activity.posterUrl)"
            class="season-banner__poster"
            mode="aspectFill"
            @click="previewPoster(activity)"
          />
          <view class="season-banner__overlay" />
          <view class="season-banner__content">
            <text
              class="season-banner__type"
              :class="activity.activityType === 'season' ? 'season-banner__type--season' : 'season-banner__type--limited'"
            >
              {{ activityTypeLabel(activity.activityType) }}
            </text>
            <text class="season-banner__title">{{ activity.name }}</text>
            <text class="season-banner__desc">
              {{ activity.description || ' ' }}
            </text>
            <view class="u-gap-2 u-flex-row-center mt-2 flex flex-wrap">
              <text
                class="season-banner__rate"
                :class="activity.activityType === 'season' ? 'season-banner__rate--season' : 'season-banner__rate--limited'"
              >
                ×{{ activity.expBuffRate }}
              </text>
              <view v-if="resolvePosterUrl(activity.posterUrl)">
                <wd-button size="small" @click="previewPoster(activity)">
                  查看海报
                </wd-button>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 底部 Tab：多活动时快速切换 -->
    <view v-if="hasMultiple" class="season-banner__tabs u-gap-2 flex">
      <view
        v-for="(activity, index) in activityCards"
        :key="activity.code"
        class="season-banner__tab"
        :class="[
          index === activeIndex ? 'season-banner__tab--active' : '',
          activity.activityType === 'season' ? 'season-banner__tab--season' : 'season-banner__tab--limited',
        ]"
        @click="selectActivity(index)"
      >
        <view class="season-banner__tab-thumb">
          <image
            v-if="resolvePosterUrl(activity.posterUrl)"
            :src="resolvePosterUrl(activity.posterUrl)"
            class="season-banner__tab-img"
            mode="aspectFill"
          />
          <text v-else class="season-banner__tab-emoji">
            {{ activity.activityType === 'season' ? '🏆' : '🎉' }}
          </text>
        </view>
        <view class="min-w-0 flex-1">
          <text class="season-banner__tab-name">{{ activity.name }}</text>
          <text class="season-banner__tab-rate">×{{ activity.expBuffRate }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.season-banner {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.85);
}

.season-banner__hud {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.season-banner__hud-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(196, 181, 253, 0.85);
  white-space: nowrap;
}

.season-banner__pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.season-banner__pill--weather {
  color: #7dd3fc;
  background: rgba(125, 211, 252, 0.12);
  border: 1px solid rgba(125, 211, 252, 0.25);
}

.season-banner__pill--effective {
  color: #fcd34d;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.25);
  font-weight: 600;
}

.season-banner__swiper {
  height: 160px;
}

.season-banner__slide {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.season-banner__slide--season:not(.season-banner__slide--poster) {
  background: linear-gradient(125deg, #4338ca 0%, #312e81 45%, #1e1b4b 100%);
}

.season-banner__slide--limited:not(.season-banner__slide--poster) {
  background: linear-gradient(125deg, #b45309 0%, #92400e 50%, #451a03 100%);
}

.season-banner__poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.season-banner__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(15, 23, 42, 0.88) 0%,
    rgba(15, 23, 42, 0.55) 50%,
    rgba(15, 23, 42, 0.25) 100%
  );
}

.season-banner__content {
  position: relative;
  z-index: 1;
  padding: 16px;
  max-width: 85%;
}

.season-banner__type {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.season-banner__type--season {
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.35);
  border: 1px solid rgba(196, 181, 253, 0.45);
}

.season-banner__type--limited {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.25);
  border: 1px solid rgba(253, 224, 71, 0.4);
}

.season-banner__title {
  display: block;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
}

.season-banner__desc {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.season-banner__rate {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.season-banner__rate--season {
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.35);
  border: 1px solid rgba(196, 181, 253, 0.45);
}

.season-banner__rate--limited {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.25);
  border: 1px solid rgba(253, 224, 71, 0.4);
}

.season-banner__tabs {
  padding: 10px 12px;
  overflow-x: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.season-banner__tab {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.season-banner__tab--active.season-banner__tab--season {
  border-color: rgba(139, 92, 246, 0.45);
  background: rgba(139, 92, 246, 0.1);
}

.season-banner__tab--active.season-banner__tab--limited {
  border-color: rgba(251, 191, 36, 0.45);
  background: rgba(251, 191, 36, 0.1);
}

.season-banner__tab-thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.season-banner__tab-img {
  width: 100%;
  height: 100%;
}

.season-banner__tab-emoji {
  font-size: 16px;
  line-height: 1;
}

.season-banner__tab-name {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.season-banner__tab-rate {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}
</style>

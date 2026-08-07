<script lang="ts" setup>
/**
 * 增益列表面板 — 双列战利品卡片，对齐 blog-home-nuxt BuffList
 */
import { BUFF_TYPE_MAP } from '@/types/rpg'
import type { BuffType, ManualExpBuffMeta, UserBuff } from '@/types/rpg'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'

const props = defineProps<{
  buffs: UserBuff[]
}>()

const emit = defineEmits<{
  toggle: [buff: UserBuff]
}>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})

function getManualExpMeta(buff: UserBuff): ManualExpBuffMeta | null {
  if (buff.triggerMode !== 'manual' || buff.buffType !== 'exp_boost')
    return null
  const meta = buff.effectJson as Partial<ManualExpBuffMeta> | null | undefined
  if (!meta?.durationMinutes)
    return null
  return {
    durationMinutes: meta.durationMinutes,
    activated: !!meta.activated,
    paused: !!meta.paused,
    remainingMs: meta.remainingMs,
  }
}

function isManualExpPending(buff: UserBuff) {
  const meta = getManualExpMeta(buff)
  return !!meta && !meta.activated
}

function isManualExpPaused(buff: UserBuff) {
  const meta = getManualExpMeta(buff)
  return !!meta?.activated && !buff.isActive
}

function formatDuration(diffMs: number): string {
  if (diffMs <= 0)
    return '即将过期'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  if (hours > 0)
    return `${hours}时${minutes}分${seconds}秒`
  if (minutes > 0)
    return `${minutes}分${seconds}秒`
  return `${seconds}秒`
}

function getEffectRemainingMs(buff: UserBuff): number {
  const meta = getManualExpMeta(buff)
  if (isManualExpPaused(buff)) {
    if (meta?.remainingMs != null)
      return meta.remainingMs
    return Math.max(0, new Date(buff.expireAt).getTime() - now.value)
  }
  return Math.max(0, new Date(buff.expireAt).getTime() - now.value)
}

function getTimeLabel(buff: UserBuff): string {
  const remaining = formatDuration(getEffectRemainingMs(buff))
  if (isManualExpPending(buff))
    return `${remaining} 内可激活`
  if (isManualExpPaused(buff))
    return `${remaining} 效果剩余（已暂停）`
  return remaining
}

function getRemainingPercent(buff: UserBuff): number {
  const meta = getManualExpMeta(buff)
  if (isManualExpPending(buff)) {
    const created = new Date(buff.createTime).getTime()
    const expire = new Date(buff.expireAt).getTime()
    const total = expire - created
    const remaining = expire - now.value
    if (total <= 0)
      return 0
    return Math.max(0, Math.min(100, (remaining / total) * 100))
  }
  const total = (meta?.durationMinutes ?? 0) * 60 * 1000
  if (total <= 0)
    return 0
  return Math.max(0, Math.min(100, (getEffectRemainingMs(buff) / total) * 100))
}

function getStatusText(buff: UserBuff): string {
  if (isManualExpPending(buff))
    return '待激活'
  if (buff.triggerMode === 'manual' && buff.isActive)
    return '激活中'
  if (isManualExpPaused(buff))
    return '已暂停'
  return '生效中'
}

function getStatusClass(buff: UserBuff): string {
  if (isManualExpPending(buff) || isManualExpPaused(buff))
    return 'rpg-loot-status--pending'
  return 'rpg-loot-status--done'
}

function getEffectText(buff: UserBuff): string {
  switch (buff.buffType as BuffType) {
    case 'exp_boost':
      return `经验+${Math.round(buff.value * 100)}%`
    case 'hp_regen':
      return `生命恢复×${buff.value}`
    case 'shield':
      return `剩余${buff.remainingUses}次`
    case 'lucky':
      return `+${buff.value}经验`
    default:
      return buff.description
  }
}

function buffIconEmoji(buff: UserBuff) {
  const key = BUFF_TYPE_MAP[buff.buffType]?.icon || 'star'
  return resolveRpgItemEmoji({ icon: key })
}

function buffColor(buff: UserBuff) {
  return BUFF_TYPE_MAP[buff.buffType]?.color || '#8b5cf6'
}

function toggleBuff(buff: UserBuff) {
  if (buff.triggerMode !== 'manual')
    return
  emit('toggle', buff)
}
</script>

<template>
  <view class="buff-section mt-4">
    <view class="section-title u-flex-row-center">
      <text class="text-tech font-medium">增益</text>
      <text v-if="buffs.length" class="buff-count">{{ buffs.length }}个</text>
    </view>

    <view v-if="!buffs.length" class="buff-empty">
      <text class="text-xs text-tech-subtle">暂无激活的增益，签到有概率获得哦~</text>
    </view>

    <scroll-view v-else scroll-y class="rpg-loot-list-scroll">
      <view class="u-grid-2 u-grid-2--loose">
        <view v-for="buff in buffs" :key="buff.id" class="u-grid-2-item">
          <view class="rpg-loot-card rpg-loot-card--buff">
            <view class="rpg-loot-card-head">
              <view
                class="rpg-loot-icon rpg-loot-icon--tinted"
                :style="{ background: buffColor(buff) }"
              >
                <text class="rpg-loot-icon__emoji">{{ buffIconEmoji(buff) }}</text>
              </view>
              <text class="rpg-loot-status" :class="getStatusClass(buff)">{{ getStatusText(buff) }}</text>
            </view>
            <text class="rpg-loot-name mt-1">{{ buff.name }}</text>
            <text class="rpg-loot-desc mt-1">{{ getEffectText(buff) }}</text>
            <view class="rpg-loot-progress">
              <view
                class="rpg-loot-progress__fill"
                :style="{
                  width: `${getRemainingPercent(buff)}%`,
                  background: buffColor(buff),
                }"
              />
            </view>
            <view class="rpg-loot-footer">
              <view class="rpg-loot-meta">
                <text class="rpg-loot-progress-text">{{ getTimeLabel(buff) }}</text>
              </view>
              <text
                v-if="buff.triggerMode === 'manual'"
                class="rpg-loot-claim-btn"
                :class="{ 'rpg-loot-claim-btn--pause': buff.isActive }"
                @click="toggleBuff(buff)"
              >
                {{ buff.isActive ? '停用' : '激活' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.section-title {
  margin-bottom: 8px;
}

.buff-count {
  margin-left: 8px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  font-weight: 700;
}

.buff-empty {
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}
</style>

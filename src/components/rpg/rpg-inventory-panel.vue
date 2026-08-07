<script lang="ts" setup>
/**
 * 背包面板（对齐 blog-home-nuxt InventoryPanel）
 * 展示字段来自 item.config / item.sourceLabel；钻石行 emit recharge 由父层处理充值
 */
import RpgItemIcon from '@/components/rpg/rpg-item-icon.vue'
import RpgPanelLoading from '@/components/rpg/rpg-panel-loading.vue'
import RpgRarityBadge from '@/components/rpg/rpg-rarity-badge.vue'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import type { InventoryItem } from '@/types/rpg'

const props = defineProps<{
  items: InventoryItem[]
  loadout: any
  loading: boolean
}>()

const emit = defineEmits<{
  equip: [slot: string, itemCode: string]
  unequip: [slot: string]
  recharge: []
}>()

const { playSfx } = useRpgAudio()
const activeType = ref<string>('all')

/** 钻石货币行（含历史 diamond code） */
function isCurrencyItem(item: InventoryItem) {
  return item.itemCode === 'currency'
    || item.itemCode === 'diamond'
    || item.config?.itemType === 'currency'
}

const typeTabs = computed(() => {
  const typeMap = new Map<string, string>()
  for (const item of props.items) {
    const cfg = item.config
    if (!cfg?.itemType)
      continue
    if (!typeMap.has(cfg.itemType))
      typeMap.set(cfg.itemType, cfg.itemTypeLabel || cfg.itemType)
  }
  return [
    { key: 'all', label: '全部' },
    ...Array.from(typeMap.entries()).map(([key, label]) => ({ key, label })),
  ]
})

const filteredItems = computed(() => {
  if (activeType.value === 'all')
    return props.items
  return props.items.filter(i => i.config?.itemType === activeType.value)
})

function isEquipped(item: InventoryItem) {
  const type = item.config?.itemType
  if (type === 'title')
    return props.loadout?.titleCode === item.itemCode
  if (type === 'avatar_frame')
    return props.loadout?.avatarFrameCode === item.itemCode
  return false
}

function isEquippable(item: InventoryItem) {
  return item.config?.itemType === 'title' || item.config?.itemType === 'avatar_frame'
}

function getEquipSlot(item: InventoryItem) {
  return item.config?.itemType === 'title' ? 'title' : 'avatar_frame'
}

function toggleEquip(item: InventoryItem) {
  if (isEquipped(item))
    emit('unequip', getEquipSlot(item))
  else
    emit('equip', getEquipSlot(item), item.itemCode)
}

/** 切换背包类型 Tab，变更时播放 tabSwitch */
function switchTypeTab(key: string) {
  if (key !== activeType.value)
    void playSfx('tabSwitch')
  activeType.value = key
}
</script>

<template>
  <view class="inventory-panel">
    <text class="rpg-section-heading">背包</text>

    <RpgPanelLoading v-if="loading" />
    <view v-else-if="!items.length" class="rpg-empty-inline">
      <text>背包为空</text>
    </view>
    <template v-else>
      <view v-if="typeTabs.length > 2" class="rpg-panel-tabs">
        <text
          v-for="tab in typeTabs"
          :key="tab.key"
          class="rpg-panel-tab"
          :class="activeType === tab.key ? 'rpg-panel-tab--active' : ''"
          @click="switchTypeTab(tab.key)"
        >
          {{ tab.label }}
        </text>
      </view>

      <view class="rpg-loot-grid inventory-grid">
        <view
          v-for="item in filteredItems"
          :key="item.id || item.itemCode"
          class="u-grid-2-item"
        >
          <view
            class="rpg-loot-card rpg-loot-card--stacked rpg-loot-card--inventory"
            :class="{ 'rpg-loot-card--active': isEquipped(item) }"
          >
            <view class="rpg-loot-card-body">
              <view class="rpg-loot-card-head">
                <RpgItemIcon
                  :icon="item.config?.icon"
                  :icon-url="item.config?.iconUrl"
                  :bg-url="item.config?.bgUrl"
                  :item-type-icon="item.config?.itemTypeIcon"
                  :rarity-color="item.config?.rarityColor"
                />
                <text class="rpg-loot-progress-text">×{{ item.quantity }}</text>
              </view>
              <text class="rpg-loot-name inventory-card__name">
                {{ item.config?.name || item.itemCode }}
              </text>
              <view class="inventory-meta">
                <text v-if="item.config?.itemType" class="rpg-chip-tag">
                  {{ item.config.itemTypeLabel || item.config.itemType }}
                </text>
                <RpgRarityBadge
                  :rarity="item.config?.rarity"
                  :rarity-label="item.config?.rarityLabel"
                  :rarity-color="item.config?.rarityColor"
                  :rarity-icon="item.config?.rarityIcon"
                />
              </view>
              <text v-if="item.sourceLabel || item.source" class="rpg-loot-desc inventory-card__source">
                {{ item.sourceLabel || item.source }}
              </text>
            </view>
            <view
              v-if="isCurrencyItem(item)"
              class="rpg-loot-card-strip rpg-loot-card-strip--recharge"
              @click="emit('recharge')"
            >
              <text>💎 充值</text>
            </view>
            <view
              v-else-if="isEquippable(item)"
              class="rpg-loot-card-strip equip-strip"
              :class="{ 'rpg-loot-card-strip--active': isEquipped(item) }"
              @click="toggleEquip(item)"
            >
              <view v-if="isEquipped(item)" class="equip-strip__row">
                <view class="equip-dot" />
                <text>穿戴中 · 卸下</text>
              </view>
              <text v-else>穿戴</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped>
.inventory-card__name,
.inventory-card__source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

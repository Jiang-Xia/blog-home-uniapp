<script lang="ts" setup>
/**
 * 背包面板（对齐 blog-home-nuxt InventoryPanel）
 * 展示字段来自 item.config / item.sourceLabel；钻石行 emit recharge 由父层处理充值
 */
import RpgItemIcon from '@/components/rpg/rpg-item-icon.vue'
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
    <text class="inventory-panel__heading">背包</text>

    <view v-if="loading" class="inventory-panel__loading">
      <text class="text-sm text-tech-subtle">加载中…</text>
    </view>
    <view v-else-if="!items.length" class="inventory-panel__empty">
      <text class="text-sm text-tech-subtle">背包为空</text>
    </view>
    <template v-else>
      <view v-if="typeTabs.length > 2" class="inventory-panel__tabs u-gap-2 flex flex-wrap">
        <view v-for="tab in typeTabs" :key="tab.key">
          <text
            class="inventory-panel__tab"
            :class="activeType === tab.key ? 'inventory-panel__tab--active' : ''"
            @click="switchTypeTab(tab.key)"
          >
            {{ tab.label }}
          </text>
        </view>
      </view>

      <view class="u-grid-2 u-grid-2--loose">
        <view
          v-for="item in filteredItems"
          :key="item.id || item.itemCode"
          class="u-grid-2-item"
        >
          <cyber-card
            class="inventory-card cyber-card-pad-sm"
            :class="isEquipped(item) ? 'inventory-card--active' : ''"
          >
            <view class="u-gap-2 u-flex-row-center">
              <RpgItemIcon
                :icon="item.config?.icon"
                :icon-url="item.config?.iconUrl"
                :bg-url="item.config?.bgUrl"
                :item-type-icon="item.config?.itemTypeIcon"
                :rarity-color="item.config?.rarityColor"
              />
              <text class="inventory-card__qty text-xs text-tech-subtle">×{{ item.quantity }}</text>
            </view>
            <text class="inventory-card__name mt-2 block text-sm text-tech font-medium">
              {{ item.config?.name || item.itemCode }}
            </text>
            <view class="u-gap-2 mt-1 flex flex-wrap">
              <text v-if="item.config?.itemType" class="inventory-card__chip text-xs text-tech-subtle">
                {{ item.config.itemTypeLabel || item.config.itemType }}
              </text>
              <RpgRarityBadge
                :rarity="item.config?.rarity"
                :rarity-label="item.config?.rarityLabel"
                :rarity-color="item.config?.rarityColor"
                :rarity-icon="item.config?.rarityIcon"
              />
            </view>
            <text v-if="item.sourceLabel || item.source" class="inventory-card__source text-tech-faint mt-1 block text-xs">
              {{ item.sourceLabel || item.source }}
            </text>
            <view class="mt-2">
              <view v-if="isCurrencyItem(item)">
                <wd-button size="small" @click="emit('recharge')">
                  💎 充值
                </wd-button>
              </view>
              <view v-else-if="isEquippable(item)">
                <wd-button
                  size="small"
                  :type="isEquipped(item) ? 'primary' : undefined"
                  @click="toggleEquip(item)"
                >
                  {{ isEquipped(item) ? '穿戴中 · 卸下' : '穿戴' }}
                </wd-button>
              </view>
            </view>
          </cyber-card>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped>
.inventory-panel__heading {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-text, rgba(255, 255, 255, 0.9));
}

.inventory-panel__loading,
.inventory-panel__empty {
  padding: 20px 12px;
  text-align: center;
}

.inventory-panel__tab {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.inventory-panel__tab--active {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.45);
  background: rgba(251, 191, 36, 0.1);
}

.inventory-card--active {
  border-color: rgba(139, 92, 246, 0.45);
}

.inventory-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-card__chip {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}

.inventory-card__source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<script lang="ts" setup>
/**
 * 宠物面板（对齐 blog-home-nuxt PetPanel）
 * 宠物蛋来自背包 eggs；钻石兑换经 useRpgModal 确认后 emit buy
 */
import RpgItemIcon from '@/components/rpg/rpg-item-icon.vue'
import RpgPanelLoading from '@/components/rpg/rpg-panel-loading.vue'
import RpgRarityBadge from '@/components/rpg/rpg-rarity-badge.vue'
import { useRpgModal } from '@/composables/use-rpg-modal'
import type { ItemConfigView } from '@/types/rpg'
import { resolveRpgItemEmoji } from '@/utils/rpg-item-icon'

const props = defineProps<{
  pets: any[]
  eggs: any[]
  catalog: ItemConfigView[]
  equippedPetId: number | null
  loading: boolean
}>()

const emit = defineEmits<{
  hatch: [itemCode: string]
  buy: [petCode: string]
  deploy: [petId: number]
  rest: []
  rename: [id: number, nickname: string]
}>()

const { confirm } = useRpgModal()

const ownedPetCodes = computed(
  () => new Set((props.pets || []).map((p: any) => p.petCode).filter(Boolean)),
)

/** 钻石可兑换项（含已兑换，用于展示完整兑换列表） */
const exchangeCatalog = computed(() =>
  (props.catalog || []).filter(item => (item.effectJson?.currencyCost ?? 0) > 0),
)

const catalogByCode = computed(() => {
  const map = new Map<string, ItemConfigView>()
  for (const item of props.catalog || [])
    map.set(item.code, item)
  return map
})

/** 我的宠物展示配置：Go 列表可能缺 effectJson，从 catalog 补齐增益等字段 */
function resolvePetConfig(pet: any): ItemConfigView | undefined {
  const catalogItem = catalogByCode.value.get(pet.petCode)
  const inline = pet.config || {}
  if (!catalogItem && !inline.code)
    return inline
  return {
    ...catalogItem,
    ...inline,
    effectJson: inline.effectJson ?? catalogItem?.effectJson,
    rarityLabel: inline.rarityLabel ?? catalogItem?.rarityLabel,
    rarityColor: inline.rarityColor ?? catalogItem?.rarityColor,
    rarityIcon: inline.rarityIcon ?? catalogItem?.rarityIcon,
    icon: inline.icon ?? catalogItem?.icon,
    iconUrl: inline.iconUrl ?? catalogItem?.iconUrl,
    bgUrl: inline.bgUrl ?? catalogItem?.bgUrl,
    itemTypeIcon: inline.itemTypeIcon ?? catalogItem?.itemTypeIcon,
    name: inline.name ?? catalogItem?.name,
  }
}

/** 宠物经验加成百分比文案，无增益时返回 null */
function petExpBoostLabel(pet: any): string | null {
  const boost = resolvePetConfig(pet)?.effectJson?.expBoost
  if (boost == null || boost <= 0)
    return null
  return `经验+${Math.round(boost * 100)}%`
}

function isOwned(code: string) {
  return ownedPetCodes.value.has(code)
}

function canExchange(item: ItemConfigView) {
  return (item.effectJson?.currencyCost ?? 0) > 0 && !isOwned(item.code)
}

const showRenameModal = ref(false)
const renamePetId = ref<number | null>(null)
const renamePetName = ref('')
const renameOriginalName = ref('')

function openRenameModal(pet: any) {
  renamePetId.value = pet.id
  renameOriginalName.value = pet.nickname || pet.config?.name || ''
  renamePetName.value = pet.nickname || ''
  showRenameModal.value = true
}

function closeRenameModal() {
  showRenameModal.value = false
  renamePetId.value = null
  renamePetName.value = ''
}

function saveRename() {
  const name = renamePetName.value.trim()
  if (!renamePetId.value || !name)
    return
  emit('rename', renamePetId.value, name)
  closeRenameModal()
}

function onSaveRenameClick() {
  if (!renamePetName.value.trim())
    return
  saveRename()
}

/** 钻石兑换前二次确认 */
async function handleBuy(catalogItem: ItemConfigView) {
  if (isOwned(catalogItem.code))
    return
  const cost = catalogItem.effectJson?.currencyCost ?? 0
  const ok = await confirm({
    title: '确认兑换宠物',
    description: `将消耗 ${cost} 钻石兑换「${catalogItem.name}」，确定继续吗？`,
    confirmLabel: '确认兑换',
    confirmColor: 'warning',
  })
  if (ok)
    emit('buy', catalogItem.code)
}
</script>

<template>
  <view class="pet-panel">
    <RpgPanelLoading v-if="loading" />
    <template v-else>
      <view v-if="exchangeCatalog.length" class="pet-panel__section">
        <text class="rpg-section-heading">钻石兑换</text>
        <view class="rpg-loot-grid">
          <view v-for="c in exchangeCatalog" :key="c.code" class="u-grid-2-item">
            <view
              class="rpg-loot-card rpg-loot-card--pet rpg-loot-card--pet-exchange"
              :class="{ 'rpg-loot-card--claimed': isOwned(c.code) }"
            >
              <view class="rpg-loot-card-head">
                <RpgItemIcon
                  :icon="c.icon"
                  :icon-url="c.iconUrl"
                  :bg-url="c.bgUrl"
                  :item-type-icon="c.itemTypeIcon"
                  :rarity-color="c.rarityColor"
                />
                <text v-if="isOwned(c.code)" class="rpg-loot-status rpg-loot-status--done">已兑换</text>
              </view>
              <text class="rpg-loot-name">{{ c.name }}</text>
              <text v-if="c.description" class="rpg-loot-desc">{{ c.description }}</text>
              <RpgRarityBadge
                :rarity="c.rarity"
                :rarity-label="c.rarityLabel"
                :rarity-color="c.rarityColor"
                :rarity-icon="c.rarityIcon"
              />
              <view class="pet-exchange-card__footer">
                <view
                  v-if="canExchange(c)"
                  class="pet-card-btn pet-card-btn--primary pet-card-btn--block"
                  @click="handleBuy(c)"
                >
                  <text class="pet-card-btn__text">💎 {{ c.effectJson?.currencyCost }} 兑换</text>
                </view>
                <text v-else class="rpg-loot-owned-mark">已拥有</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="eggs.length" class="pet-panel__section">
        <text class="rpg-section-heading">宠物蛋</text>
        <view class="rpg-panel-tabs">
          <text
            v-for="e in eggs"
            :key="e.itemCode"
            class="rpg-panel-tab"
            @click="emit('hatch', e.itemCode)"
          >
            {{ resolveRpgItemEmoji(e.config) }} {{ e.config?.name }} 孵化
          </text>
        </view>
      </view>

      <view class="pet-panel__section">
        <view class="pet-panel__head">
          <text class="rpg-section-heading pet-panel__heading-inline">我的宠物</text>
          <text v-if="equippedPetId" class="rpg-panel-tab" @click="emit('rest')">
            休息（下架）
          </text>
        </view>
        <view v-if="!pets.length" class="rpg-empty-inline">
          <text>暂无宠物</text>
        </view>
        <view v-else class="rpg-loot-grid">
          <view v-for="p in pets" :key="p.id" class="u-grid-2-item">
            <view
              class="rpg-loot-card rpg-loot-card--pet rpg-loot-card--pet-owned"
              :class="{ 'rpg-loot-card--active': equippedPetId === p.id }"
            >
              <view class="rpg-loot-card-head">
                <RpgItemIcon
                  :icon="resolvePetConfig(p)?.icon"
                  :icon-url="resolvePetConfig(p)?.iconUrl"
                  :bg-url="resolvePetConfig(p)?.bgUrl"
                  :item-type-icon="resolvePetConfig(p)?.itemTypeIcon"
                  :rarity-color="resolvePetConfig(p)?.rarityColor"
                />
                <text v-if="equippedPetId === p.id" class="rpg-loot-status rpg-loot-status--done">出战中</text>
              </view>
              <text class="rpg-loot-name">{{ p.nickname || resolvePetConfig(p)?.name }}</text>
              <text class="rpg-loot-desc">
                Lv{{ p.level ?? 1 }}<text v-if="petExpBoostLabel(p)"> · {{ petExpBoostLabel(p) }}</text>
              </text>
              <view class="pet-owned-card__actions">
                <view
                  v-if="equippedPetId !== p.id"
                  class="pet-card-btn pet-card-btn--primary"
                  @click="emit('deploy', p.id)"
                >
                  <text class="pet-card-btn__text">出战</text>
                </view>
                <view class="pet-card-btn pet-card-btn--secondary" @click="openRenameModal(p)">
                  <text class="pet-card-btn__text">改名</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <wd-popup v-model="showRenameModal" position="bottom" closable @close="closeRenameModal">
      <view class="pet-rename-modal cyber-card-pad-lg">
        <text class="block text-lg text-tech font-bold">宠物改名</text>
        <text v-if="renameOriginalName" class="mt-1 block text-sm text-tech-muted">
          当前：{{ renameOriginalName }}
        </text>
        <wd-input
          v-model="renamePetName"
          class="mt-3"
          :maxlength="20"
          placeholder="输入新昵称"
        />
        <view class="pet-rename-modal__actions">
          <text class="rpg-panel-tab" @click="closeRenameModal">取消</text>
          <text
            class="rpg-loot-claim-btn"
            :class="{ 'pet-rename-modal__save--disabled': !renamePetName.trim() }"
            @click="onSaveRenameClick"
          >
            保存
          </text>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.pet-panel__section {
  margin-bottom: 16px;
}

.pet-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pet-panel__heading-inline {
  margin-bottom: 0;
}

.pet-exchange-card__footer {
  width: 100%;
  min-width: 0;
  margin-top: auto;
  padding-top: 6px;
  box-sizing: border-box;
}

.pet-owned-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: auto;
  padding-top: 6px;
}

.pet-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 12px;
  margin-right: 6px;
  border-radius: 999px;
  box-sizing: border-box;
  border: 1px solid transparent;
}

.pet-card-btn__text {
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.pet-card-btn--primary {
  background: linear-gradient(135deg, #fbbf24, #d97706);
}

.pet-card-btn--primary .pet-card-btn__text {
  color: #fff;
}

.pet-card-btn--secondary {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.pet-card-btn--secondary .pet-card-btn__text {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.pet-card-btn--block {
  display: flex;
  width: 100%;
  max-width: 100%;
  margin-right: 0;
}

.pet-rename-modal {
  min-height: 200px;
}

.pet-rename-modal__actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
}

.pet-rename-modal__actions .rpg-panel-tab,
.pet-rename-modal__actions .rpg-loot-claim-btn {
  margin-right: 8px;
  margin-top: 0;
}

.pet-rename-modal__save--disabled {
  opacity: 0.45;
}
</style>

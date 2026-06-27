<script lang="ts" setup>
/**
 * 宠物面板（对齐 blog-home-nuxt PetPanel）
 * 宠物蛋来自背包 eggs；钻石兑换经 useRpgModal 确认后 emit buy
 */
import RpgItemIcon from '@/components/rpg/rpg-item-icon.vue'
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
  <view class="pet-panel u-stack-4">
    <view v-if="loading" class="pet-panel__loading">
      <text class="text-sm text-tech-subtle">加载中…</text>
    </view>
    <template v-else>
      <view v-if="exchangeCatalog.length">
        <text class="pet-panel__heading">钻石兑换</text>
        <view class="u-grid-2 u-grid-2--loose mt-2">
          <view v-for="c in exchangeCatalog" :key="c.code" class="u-grid-2-item">
            <cyber-card
              class="cyber-card-pad-sm"
              :class="isOwned(c.code) ? 'pet-card--claimed' : ''"
            >
              <view class="u-gap-2 u-flex-row-center">
                <RpgItemIcon
                  :icon="c.icon"
                  :icon-url="c.iconUrl"
                  :bg-url="c.bgUrl"
                  :item-type-icon="c.itemTypeIcon"
                  :rarity-color="c.rarityColor"
                />
                <text v-if="isOwned(c.code)" class="text-xs text-green-400">已兑换</text>
              </view>
              <text class="mt-2 block text-sm text-tech font-medium">{{ c.name }}</text>
              <text v-if="c.description" class="mt-1 block text-xs text-tech-muted">{{ c.description }}</text>
              <view class="mt-1">
                <RpgRarityBadge
                  :rarity="c.rarity"
                  :rarity-label="c.rarityLabel"
                  :rarity-color="c.rarityColor"
                  :rarity-icon="c.rarityIcon"
                />
              </view>
              <view class="mt-2">
                <view v-if="canExchange(c)">
                  <wd-button size="small" @click="handleBuy(c)">
                    💎 {{ c.effectJson?.currencyCost }} 兑换
                  </wd-button>
                </view>
                <text v-else class="text-xs text-tech-subtle">已拥有</text>
              </view>
            </cyber-card>
          </view>
        </view>
      </view>

      <view v-if="eggs.length">
        <text class="pet-panel__heading">宠物蛋</text>
        <view class="u-gap-2 mt-2 flex flex-wrap">
          <view v-for="e in eggs" :key="e.itemCode">
            <wd-button size="small" @click="emit('hatch', e.itemCode)">
              {{ resolveRpgItemEmoji(e.config) }} {{ e.config?.name }} 孵化
            </wd-button>
          </view>
        </view>
      </view>

      <view>
        <view class="u-flex-row-center flex items-center justify-between">
          <text class="pet-panel__heading">我的宠物</text>
          <view v-if="equippedPetId">
            <wd-button size="small" @click="emit('rest')">
              休息（下架）
            </wd-button>
          </view>
        </view>
        <view v-if="!pets.length" class="pet-panel__empty mt-2">
          <text class="text-sm text-tech-subtle">暂无宠物</text>
        </view>
        <view v-else class="u-grid-2 u-grid-2--loose mt-2">
          <view v-for="p in pets" :key="p.id" class="u-grid-2-item">
            <cyber-card
              class="cyber-card-pad-sm"
              :class="equippedPetId === p.id ? 'pet-card--active' : ''"
            >
              <view class="u-gap-2 u-flex-row-center">
                <RpgItemIcon
                  :icon="p.config?.icon"
                  :icon-url="p.config?.iconUrl"
                  :bg-url="p.config?.bgUrl"
                  :item-type-icon="p.config?.itemTypeIcon"
                  :rarity-color="p.config?.rarityColor"
                />
                <text v-if="equippedPetId === p.id" class="text-xs text-green-400">出战中</text>
              </view>
              <text class="mt-2 block text-sm text-tech font-medium">
                {{ p.nickname || p.config?.name }}
              </text>
              <text class="mt-1 block text-xs text-tech-muted">
                Lv{{ p.level }}
                <text v-if="p.config?.effectJson?.expBoost">
                  · 经验+{{ Math.round(p.config.effectJson.expBoost * 100) }}%
                </text>
              </text>
              <view class="u-gap-2 mt-2 flex flex-wrap">
                <view v-if="equippedPetId !== p.id">
                  <wd-button size="small" @click="emit('deploy', p.id)">
                    出战
                  </wd-button>
                </view>
                <view>
                  <wd-button size="small" @click="openRenameModal(p)">
                    改名
                  </wd-button>
                </view>
              </view>
            </cyber-card>
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
        <view class="u-gap-2 mt-4 flex flex-wrap">
          <view>
            <wd-button size="small" @click="closeRenameModal">
              取消
            </wd-button>
          </view>
          <view>
            <wd-button size="small" type="primary" :disabled="!renamePetName.trim()" @click="saveRename">
              保存
            </wd-button>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.pet-panel__heading {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-text, rgba(255, 255, 255, 0.9));
}

.pet-panel__loading,
.pet-panel__empty {
  padding: 16px 0;
  text-align: center;
}

.pet-card--active {
  border-color: rgba(139, 92, 246, 0.45);
}

.pet-card--claimed {
  opacity: 0.75;
}

.pet-rename-modal {
  min-height: 200px;
}
</style>

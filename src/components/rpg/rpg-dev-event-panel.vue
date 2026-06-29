<script lang="ts" setup>
/**
 * RPG WebSocket 事件本地挡板（对齐 blog-home-nuxt RpgDevEventPanel）
 * - dev 全站；生产仅 pages-tool/test
 */
import { useRpgRecharge } from '@/composables/use-rpg-recharge'
import { useTokenStore } from '@/store/token'
import { canUseRpgDevMock } from '@/utils/rpg-dev-mock-guard'
import {
  getRpgMockEventCoverage,
  groupRpgMockScenarios,
  RPG_ALL_WS_EVENTS,
  RPG_MOCK_SCENARIOS,

  runRpgMockScenario,
} from '@/utils/rpg-dev-mock'
import type { RpgMockContext } from '@/utils/rpg-dev-mock'

const props = withDefaults(
  defineProps<{
    context?: RpgMockContext
    /** 紧凑模式：冒险页内嵌，仅 dev */
    compact?: boolean
  }>(),
  {
    context: () => ({}),
    compact: false,
  },
)

const tokenStore = useTokenStore()
const { openRechargeModal } = useRpgRecharge()
const isDev = import.meta.env.DEV

const showPanel = computed(() => {
  if (props.compact)
    return isDev
  return canUseRpgDevMock()
})

const groups = groupRpgMockScenarios(RPG_MOCK_SCENARIOS)
const coverage = computed(() => getRpgMockEventCoverage())
const coveredCount = computed(() => coverage.value.filter(c => c.covered).length)
const allCovered = computed(() => coveredCount.value === RPG_ALL_WS_EVENTS.length)

function onRun(scenario: (typeof RPG_MOCK_SCENARIOS)[number]) {
  runRpgMockScenario(scenario, props.context)
}
</script>

<template>
  <view v-if="showPanel" class="rpg-dev-panel" :class="{ compact }">
    <view class="panel-meta">
      <text class="panel-hint">
        覆盖 {{ coveredCount }}/{{ RPG_ALL_WS_EVENTS.length }} 种 WS 事件
        <text :class="allCovered ? 'text-success' : 'text-warning'">
          {{ allCovered ? '（齐全）' : '（有遗漏）' }}
        </text>
        · 走 RpgGlobalInit 监听链
      </text>
      <text v-if="!tokenStore.hasLogin" class="panel-warn">
        ⚠️ 未登录：请先登录后再点按钮，否则无 Toast / 弹窗反馈
      </text>
      <text v-else class="panel-ok">
        ✅ 已登录；全屏弹窗由 layout 挂载的 Animation 组件展示
        <text v-if="!isDev">（生产环境仅本测试页可用挡板）</text>
      </text>
      <text class="panel-note">
        「经验获得」Toast 有约 5s 防抖；「站内通知」看我的页 inbox 角标
      </text>
    </view>

    <view class="panel-group">
      <text class="panel-group-title">非 WS（UI）</text>
      <view class="panel-actions">
        <wd-button size="small" type="primary" @click="openRechargeModal">
          💎 钻石充值
        </wd-button>
      </view>
    </view>

    <view v-for="group in groups" :key="group.title" class="panel-group">
      <text class="panel-group-title">{{ group.title }}</text>
      <view class="panel-actions">
        <wd-button
          v-for="item in group.items"
          :key="item.key"
          size="small"
          :type="item.btnType"
          plain
          @click="onRun(item)"
        >
          {{ item.label }}
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.rpg-dev-panel {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.06);
}

.rpg-dev-panel.compact {
  padding: 10px 12px;
  margin-bottom: 12px;
}

.panel-meta {
  margin-bottom: 10px;
}

.panel-hint,
.panel-warn,
.panel-ok,
.panel-note {
  display: block;
  font-size: 11px;
  line-height: 1.5;
}

.panel-hint {
  color: rgba(226, 232, 240, 0.55);
  margin-bottom: 4px;
}

.panel-warn {
  color: #b45309;
  margin-bottom: 4px;
}

.panel-ok {
  color: #15803d;
  margin-bottom: 4px;
}

.panel-note {
  color: rgba(226, 232, 240, 0.45);
}

.text-success {
  color: #15803d;
}

.text-warning {
  color: #b45309;
}

.panel-group + .panel-group {
  margin-top: 10px;
}

.panel-group-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 6px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>

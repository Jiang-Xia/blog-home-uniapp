<script lang="ts" setup>
/**
 * RPG 冒险攻略（对齐 blog-home-nuxt pages/features/rpg-guide.vue，12 章静态说明）
 */
import { ROUTE_RPG_ENTRY, ROUTE_RPG_FULL } from '@/router/routes'

definePage({
  style: { navigationBarTitleText: 'RPG 玩法说明' },
})

const toc = [
  { id: 'overview', label: '系统概述' },
  { id: 'start', label: '新手入门' },
  { id: 'sign', label: '签到与等级' },
  { id: 'quest', label: '任务与成就' },
  { id: 'inventory', label: '背包与装扮' },
  { id: 'lottery', label: '抽奖与 Buff' },
  { id: 'article', label: '文章成长' },
  { id: 'economy', label: '钻石经济' },
  { id: 'social', label: '社交互动' },
  { id: 'season', label: '赛季与排行' },
  { id: 'punish', label: '生命值与禁言' },
  { id: 'tips', label: '进阶技巧' },
]

const expSources = [
  { source: '每日签到', exp: '10 + 连续奖励', limit: '无' },
  { source: '评论 / 回复 / 留言', exp: '5', limit: '无' },
  { source: '发布文章', exp: '20', limit: '无' },
  { source: '点赞', exp: '2', limit: '10/天' },
  { source: '收藏', exp: '3', limit: '15/天' },
  { source: '每日 / 悬赏任务', exp: '5~15', limit: '见任务说明' },
  { source: '成就 / 抽奖', exp: '5~200', limit: '无' },
]

const levelRewards = [
  { level: 'LV2', frame: '初级头像框', title: '—', currency: '+20 钻石' },
  { level: 'LV5', frame: '中级头像框', title: '青铜达人', currency: '+50 钻石' },
  { level: 'LV10', frame: '高级头像框', title: '白银大师', currency: '+100 钻石' },
  { level: 'LV15', frame: '稀有头像框', title: '黄金传说', currency: '+200 钻石' },
]

const dailyQuests = [
  { name: '每日签到', target: '签到 1 次', exp: '5' },
  { name: '参与评论', target: '评论 2 次', exp: '10' },
  { name: '发布文章', target: '发文 1 篇', exp: '15' },
  { name: '点赞文章', target: '点赞 3 次', exp: '8' },
  { name: '收藏文章', target: '收藏 1 篇', exp: '5' },
  { name: '留言互动', target: '留言 1 条', exp: '5' },
]

const socialActions = [
  { action: '加油', effect: '目标 +10 HP', cost: '免费', limit: '3 次/天' },
  { action: '砸蛋', effect: '目标 -5 HP', cost: '15 钻石', limit: '3 次/天' },
  { action: '送花', effect: '目标 +3 声望', cost: '10 钻石', limit: '5 次/天' },
  { action: '打赏', effect: '作者获得等额钻石', cost: '≥1 钻石', limit: '不可打赏自己' },
]

function goRpg() {
  uni.navigateTo({ url: ROUTE_RPG_FULL })
}

function goEntry() {
  uni.switchTab({ url: ROUTE_RPG_ENTRY })
}
</script>

<template>
  <scroll-view scroll-y class="guide-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-4">
      <cyber-section-header
        label="GUIDE"
        title="RPG 冒险攻略"
        subtitle="从签到升级到赛季排行，一文掌握全部玩法"
        align="left"
      />

      <cyber-card class="mb-4 !p-4">
        <text class="block text-sm text-tech-muted leading-relaxed">
          博客 RPG 是嵌入站点的游戏化激励：阅读、创作、互动同时积累经验、钻石与装扮。入口在 Tab「冒险」，登录后即可参与。
        </text>
        <view class="u-gap-2 mt-4 flex flex-wrap">
          <view>
            <cyber-button variant="primary" size="small" @click="goRpg">
              进入冒险中心
            </cyber-button>
          </view>
          <view>
            <cyber-button variant="secondary" size="small" @click="goEntry">
              返回冒险 Tab
            </cyber-button>
          </view>
        </view>
      </cyber-card>

      <scroll-view scroll-x class="toc-scroll mb-4">
        <view class="flex">
          <text v-for="item in toc" :key="item.id" class="toc-item mr-2 shrink-0">{{ item.label }}</text>
        </view>
      </scroll-view>

      <cyber-card id="overview" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">系统概述</text>
        <text class="mt-2 block text-sm text-tech-muted leading-relaxed">
          七大维度：签到等级、任务成就、背包装扮、抽奖 Buff、文章成长、钻石经济、社交互动与赛季排行。数据与 Web 端实时同步。
        </text>
      </cyber-card>

      <cyber-card id="start" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">新手入门</text>
        <text class="mt-2 block text-sm text-tech-muted">1. 登录账号 → 2. Tab「冒险」进入中心 → 3. 每日签到 → 4. 完成日常任务 → 5. 抽奖或穿戴装扮。</text>
      </cyber-card>

      <cyber-card id="sign" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">签到与等级</text>
        <text class="mb-3 mt-2 block text-sm text-tech-muted">连续签到有额外 EXP；升级解锁等级奖励（头像框、称号、钻石）。</text>
        <view v-for="row in levelRewards" :key="row.level" class="mb-2 table-row">
          <text class="text-xs text-tech">{{ row.level }}</text>
          <text class="text-xs text-tech-muted">{{ row.frame }} · {{ row.title }} · {{ row.currency }}</text>
        </view>
      </cyber-card>

      <cyber-card id="quest" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">任务与成就</text>
        <text class="mb-3 mt-2 block text-sm text-tech-muted">任务分日常/悬赏/周常/特殊；完成后手动领取。成就为长期目标。</text>
        <view v-for="q in dailyQuests" :key="q.name" class="mb-2 flex table-row justify-between">
          <text class="text-xs text-tech">{{ q.name }}</text>
          <text class="text-xs text-tech-subtle">{{ q.target }} · +{{ q.exp }} EXP</text>
        </view>
      </cyber-card>

      <cyber-card id="inventory" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">背包与装扮</text>
        <text class="mt-2 block text-sm text-tech-muted">背包按类型筛选；称号与头像框可装备，宠物蛋在宠物 Tab 孵化。</text>
      </cyber-card>

      <cyber-card id="lottery" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">抽奖与 Buff</text>
        <text class="mt-2 block text-sm text-tech-muted">单抽/十连，抽奖券或钻石支付；史诗/传说有保底计数。经验 Buff 需手动激活。</text>
      </cyber-card>

      <cyber-card id="article" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">文章成长</text>
        <text class="mb-3 mt-2 block text-sm text-tech-muted">发文、互动获得 EXP，推进任务与成就。</text>
        <view v-for="row in expSources" :key="row.source" class="mb-2 flex table-row justify-between">
          <text class="text-xs text-tech">{{ row.source }}</text>
          <text class="text-xs text-tech-subtle">{{ row.exp }} · {{ row.limit }}</text>
        </view>
      </cyber-card>

      <cyber-card id="economy" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">钻石经济</text>
        <text class="mt-2 block text-sm text-tech-muted">充值获得钻石，用于抽奖、社交、宠物兑换等。支付成功后 WebSocket 推送到账。</text>
      </cyber-card>

      <cyber-card id="social" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">社交互动</text>
        <view v-for="s in socialActions" :key="s.action" class="mb-2 table-row">
          <text class="text-xs text-tech font-medium">{{ s.action }}</text>
          <text class="text-xs text-tech-muted">{{ s.effect }} · {{ s.cost }} · {{ s.limit }}</text>
        </view>
      </cyber-card>

      <cyber-card id="season" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">赛季与排行</text>
        <text class="mt-2 block text-sm text-tech-muted">经验/声望/钻石/等级/签到五维度；总榜/赛季/周/月四周期。赛季活动提供 EXP 加成。</text>
      </cyber-card>

      <cyber-card id="punish" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">生命值与禁言</text>
        <text class="mt-2 block text-sm text-tech-muted">敏感词命中扣生命；生命归零可能禁言。签到与 Buff 可恢复生命。</text>
      </cyber-card>

      <cyber-card id="tips" class="guide-section mb-4 !p-4">
        <text class="block text-tech-primary font-medium">进阶技巧</text>
        <text class="mt-2 block text-sm text-tech-muted">优先完成高 EXP 任务；十连抽奖更省券；赛季初冲榜；宠物出战提供加成；加入公会参与协作。</text>
      </cyber-card>
    </view>
  </scroll-view>
</template>

<style scoped>
.toc-scroll {
  white-space: nowrap;
}
.toc-item {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(226, 232, 240, 0.7);
}
.table-row {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
</style>

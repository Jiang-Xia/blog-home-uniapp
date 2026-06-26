<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: 'RPG 玩法说明' },
})

const sections = [
  {
    title: '签到与升级',
    content: '每日签到可获得经验与生命值恢复。积累经验升级解锁称号、头像框与等级奖励。',
  },
  {
    title: '任务与成就',
    content: '完成日常/成就任务后领取奖励。部分任务与博客互动（评论、发文）关联。',
  },
  {
    title: '抽奖与背包',
    content: '使用抽奖券或钻石抽奖获得道具。背包中可查看、穿戴称号/头像框等物品。',
  },
  {
    title: '宠物与公会',
    content: '孵化宠物提供加成；加入或创建公会与其他冒险者协作，参与公会活动。',
  },
  {
    title: '排行榜',
    content: '经验、签到、等级、声望、钻石等维度排行榜，周榜/月榜/赛季榜定期刷新。',
  },
  {
    title: '充值',
    content: '通过充值获得钻石，用于抽奖和部分玩法。H5/小程序/App 三端均支持（依平台支付能力）。',
  },
]
</script>

<template>
  <scroll-view scroll-y class="guide-page cyber-page-grid u-page-scroll">
    <view class="u-page-body py-4">
      <cyber-section-header
        label="GUIDE"
        title="RPG 冒险指南"
        subtitle="规则说明与玩法一览"
        align="left"
      />
      <cyber-card v-for="(s, i) in sections" :key="i" class="mb-4 !p-4">
        <text class="block text-tech-primary font-medium">{{ s.title }}</text>
        <text class="mt-2 block text-sm text-tech-muted leading-relaxed">{{ s.content }}</text>
      </cyber-card>
    </view>
  </scroll-view>
</template>

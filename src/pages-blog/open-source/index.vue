<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: '开源与合作' },
})

const projects = [
  { title: 'blog-home-nuxt', desc: 'Web 前台（Nuxt 3），端口 5050' },
  { title: 'blog-home-uniapp', desc: '移动端前台（uni-app），H5 / 小程序 / App' },
  { title: 'blog-admin', desc: '管理后台（Vue 3），端口 9856' },
  { title: 'blog-server', desc: 'NestJS 后端 API，端口 5000（闭源）' },
]
</script>

<template>
  <scroll-view scroll-y class="open-source-page cyber-page-grid u-page-scroll">
    <cyber-page-container :grid="false" label="OPEN SOURCE" title="三端项目说明" subtitle="前端开源 · 后端闭源政策">
      <view class="u-stack-3">
        <view v-for="item in projects" :key="item.title">
          <cyber-card class="!p-4">
            <text class="block text-tech font-medium">{{ item.title }}</text>
            <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
          </cyber-card>
        </view>
        <view>
          <cyber-alert variant="warning">
            <text class="text-sm text-tech-muted">
              <text class="text-tech font-semibold">后端闭源政策：</text>
              前端项目开源，blog-server 后端闭源。如需技术咨询或定制开发，请通过 Web 端「开源与合作」页联系。
            </text>
          </cyber-alert>
        </view>
      </view>
    </cyber-page-container>
  </scroll-view>
</template>

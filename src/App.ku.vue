<script setup lang="ts">
/**
 * 全局根组件（@uni-ku/root）：包裹页面 + 自定义 TabBar
 * - data-theme 挂在根节点，CSS 变量供页面与 TabBar 共同继承
 * - onShow 刷新原生导航栏色，避免页面 style 覆盖后仍显示旧主题
 */
import { ref } from 'vue'
import { useTheme } from '@/composables/use-theme'
import FgTabbar from '@/tabbar/index.vue'
import { isPageTabbar } from './tabbar/store'
import { currRoute } from './utils'

const { theme, syncNativeChrome } = useTheme()

const isCurrentPageTabbar = ref(true)
onShow(() => {
  const { path } = currRoute()
  // “蜡笔小开心”提到本地是 '/pages/index/index'，线上是 '/' 导致线上 tabbar 不见了
  // 所以这里需要判断一下，如果是 '/' 就当做首页，也要显示 tabbar
  if (path === '/') {
    isCurrentPageTabbar.value = true
  }
  else {
    isCurrentPageTabbar.value = isPageTabbar(path)
  }
  syncNativeChrome()
})

const helloKuRoot = ref('Hello AppKuVue')

const exposeRef = ref('this is form app.Ku.vue')

defineExpose({
  exposeRef,
})
</script>

<template>
  <view class="app-theme-root" :data-theme="theme">
    <!-- 这个先隐藏了，知道这样用就行 -->
    <view class="hidden text-center">
      {{ helloKuRoot }}，这里可以配置全局的东西
    </view>

    <KuRootView />

    <FgTabbar v-if="isCurrentPageTabbar" />
  </view>
</template>

import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { tabBar } from './src/tabbar/config'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'Blog Home',
    navigationBarBackgroundColor: '#050505',
    navigationBarTextStyle: 'white',
    backgroundColor: '#050505',
    /** 分包/页面过渡加载时窗口上下拉背景，避免 MP 底部露白 */
    backgroundColorTop: '#050505',
    backgroundColorBottom: '#050505',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^cyber-(.*)': '@/components/cyber/cyber-$1.vue',
      '^fg-(.*)': '@/components/fg-$1/fg-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
      '^wd-(.*)': '@wot-ui/ui/components/wd-$1/wd-$1.vue',
    },
  },
  preloadRule: {
    /** 首页/详情/我的会触发 RPG 音效，预载 pages-rpg 分包 static */
    'pages/index/index': {
      network: 'all',
      packages: ['pages-rpg'],
    },
    'pages/detail/detail': {
      network: 'all',
      packages: ['pages-rpg'],
    },
    'pages/me/me': {
      network: 'all',
      packages: ['pages-rpg', 'pages-blog'],
    },
    'pages/rpg/entry': {
      network: 'all',
      packages: ['pages-rpg'],
    },
    'pages/explore/explore': {
      network: 'wifi',
      packages: ['pages-blog'],
    },
  },
  // tabbar 的配置统一在 “./src/tabbar/config.ts” 文件中
  tabBar: tabBar as any,
})

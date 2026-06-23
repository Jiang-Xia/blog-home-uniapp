<script lang="ts" setup>
definePage({
  style: { navigationBarTitleText: '工具箱' },
})

const nuxtHome = import.meta.env.VITE_NUXT_HOME_URL || 'http://localhost:5050'

const tools = [
  { title: '编码转换', desc: 'Base64 / URL 编解码', route: '/pages-tool/codes/index' },
  { title: 'RSA 加解密', desc: '非对称加密，生成密钥对', route: '/pages-tool/rsa/index' },
  { title: '对称加密', desc: 'AES / DES / TripleDES 等', route: '/pages-tool/crypto/index' },
  { title: '国密 SM2', desc: 'SM2 加解密（三端）', route: '/pages-tool/sm/index' },
  { title: '二维码', desc: '文本/URL 生成二维码', route: '/pages-tool/qrcode/index' },
  { title: 'AI 摘要', desc: '长文智能摘要（H5 + Nuxt 代理）', route: '/pages-tool/ai-summary/index' },
  // #ifdef H5
  { title: '批量水印', desc: '多图加水印并 ZIP 导出', route: '/pages-tool/watermark/index' },
  { title: 'PDF 预览', desc: 'PDF 在线预览', route: '/pages-tool/pdf/index' },
  { title: '光影边框', desc: '打开 Web 版工具', route: '/pages-tool/h5-web/index?path=/tool/photos&title=光影边框' },
  { title: 'WebRTC 调试', desc: '打开 Web 版工具', route: '/pages-tool/h5-web/index?path=/tool/webrtc&title=WebRTC' },
  { title: '音频可视化', desc: '打开 Web 版工具', route: '/pages-tool/h5-web/index?path=/tool/audio-visualized&title=音频可视化' },
  // #endif
]

function goTool(route: string) {
  uni.navigateTo({ url: route })
}
</script>

<template>
  <scroll-view scroll-y class="tool-index cyber-page-grid">
    <cyber-page-container :grid="false" label="TOOLS" title="实用工具">
      <view class="flex flex-col gap-3">
        <view
          v-for="item in tools"
          :key="item.route"
          @click="goTool(item.route)"
        >
          <cyber-card class="flex flex-col !p-4">
            <text class="block text-tech font-medium">{{ item.title }}</text>
            <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
          </cyber-card>
        </view>
      </view>
      <!-- #ifndef H5 -->
      <view class="cyber-glass-card mt-4 p-3">
        <text class="text-xs text-tech-subtle">水印、PDF、WebRTC 等多媒体工具请在浏览器 H5 版使用，或复制 Web 链接：{{ nuxtHome }}</text>
      </view>
      <!-- #endif -->
    </cyber-page-container>
  </scroll-view>
</template>

<style scoped>
.tool-index {
  height: 100vh;
}
</style>

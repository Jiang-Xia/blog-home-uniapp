<script lang="ts" setup>
/**
 * 工具箱首页 — 对齐 Nuxt TOOL_LINKS（WebRTC 暂未支持）
 */
definePage({
  style: { navigationBarTitleText: '工具箱' },
})

const tools = [
  { title: '条形/二维码', desc: '条形码与二维码生成', route: '/pages-tool/codes/index' },
  { title: 'PDF 电子签名', desc: '预览 PDF 并手写签名', route: '/pages-tool/pdf/index' },
  { title: '批量水印', desc: '多图加水印并导出', route: '/pages-tool/watermark/index' },
  { title: '光影边框', desc: '渐变背景与品牌 logo 相框', route: '/pages-tool/photos/index' },
  { title: '音频可视化', desc: '频谱柱与波形动画', route: '/pages-tool/audio-visualized/index' },
  { title: '切片上传', desc: '大文件分片上传与合并', route: '/pages-tool/upload-slice/index' },
  { title: '其他工具', desc: '更多实用工具敬请期待', route: '/pages-tool/other/index' },
  { title: 'RSA 加解密', desc: '非对称加密，512–4096 bit', route: '/pages-tool/rsa/index' },
  { title: '对称加密', desc: 'AES / DES / TripleDES 等', route: '/pages-tool/crypto/index' },
  { title: '国密 SM2', desc: 'SM2 加解密（三端）', route: '/pages-tool/sm/index' },
  { title: 'AI 对话', desc: 'DeepSeek 流式对话', route: '/pages-tool/ai/index' },
  { title: 'AI 文章摘要', desc: '多风格长文智能摘要', route: '/pages-tool/ai-summary/index' },
  { title: '开发测试', desc: 'RPG WS 挡板 / Toast / SSE Lab', route: '/pages-tool/test/index' },
]

function goTool(route: string) {
  uni.navigateTo({ url: route })
}
</script>

<template>
  <scroll-view scroll-y class="tool-index cyber-page-grid u-page-scroll">
    <cyber-page-container :grid="false" label="TOOLS" title="实用工具">
      <view class="u-stack-3 flex flex-col">
        <view
          v-for="item in tools"
          :key="item.route"
          @click="goTool(item.route)"
        >
          <cyber-card>
            <text class="block text-tech font-medium">{{ item.title }}</text>
            <text class="mt-1 block text-sm text-tech-muted">{{ item.desc }}</text>
          </cyber-card>
        </view>
      </view>
    </cyber-page-container>
  </scroll-view>
</template>

/**
 * H5 冒烟测试：验证关键页面可加载、无致命控制台错误
 * 用法：node scripts/smoke-h5.mjs
 * 前置：pnpm dev（9000）+ blog-server（5000）
 */
import process from 'node:process'
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:9000'

const routes = [
  { name: '首页', path: 'pages/index/index', expectText: 'Blog Home' },
  { name: '发现', path: 'pages/explore/explore', expectText: '发现' },
  { name: '登录', path: 'pages/auth/login', expectText: '账号登录' },
  { name: '注册', path: 'pages/auth/register', expectText: '账号注册' },
  { name: '搜索', path: 'pages/search/search', expectText: '搜索' },
  { name: '关于', path: 'pages/about/about', expectText: 'Blog Home' },
  { name: 'RPG入口', path: 'pages/rpg/entry', expectText: '冒险' },
  { name: '玩法说明', path: 'pages-rpg/guide/index', expectText: 'RPG 冒险指南' },
  { name: '归档', path: 'pages-blog/archives/index', expectText: '文章归档' },
  { name: '留言板', path: 'pages-blog/msgboard/index', expectText: '留言' },
  { name: '开源', path: 'pages-blog/open-source/index', expectText: '三端项目' },
  { name: '工具箱', path: 'pages-tool/index/index', expectText: '实用工具' },
  { name: '编码转换', path: 'pages-tool/codes/index', expectText: '条形码' },
  { name: 'RSA', path: 'pages-tool/rsa/index', expectText: '生成秘钥' },
  { name: 'SM2', path: 'pages-tool/sm/index', expectText: '生成秘钥' },
  { name: '二维码', path: 'pages-tool/qrcode/index', expectText: '条形码' },
  { name: 'AI摘要', path: 'pages-tool/ai-summary/index', expectText: '生成摘要' },
  { name: 'AI对话', path: 'pages-tool/ai/index', expectText: 'baseURL' },
  { name: '批量水印', path: 'pages-tool/watermark/index', expectText: '水印' },
  { name: '光影边框', path: 'pages-tool/photos/index', expectText: '光影' },
  { name: '音频可视化', path: 'pages-tool/audio-visualized/index', expectText: '音频' },
  { name: '切片上传', path: 'pages-tool/upload-slice/index', expectText: '分片' },
  { name: 'PDF签名', path: 'pages-tool/pdf/index', expectText: 'PDF' },
  { name: '友链', path: 'pages-blog/links/index', expectText: '友链' },
  { name: '写文章', path: 'pages-blog/user/article/edit', expectText: '账号登录' },
]

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []
  const results = []

  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`)
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error')
      errors.push(`[console.error] ${msg.text()}`)
  })

  for (const route of routes) {
    const url = `${BASE}/#/${route.path}`
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(800)
      const body = await page.locator('body').textContent() ?? ''
      const ok = body.includes(route.expectText)
      results.push({ ...route, ok, url })
      if (!ok)
        errors.push(`[${route.name}] 未找到期望文案「${route.expectText}」`)
    }
    catch (e) {
      results.push({ ...route, ok: false, url, error: String(e) })
      errors.push(`[${route.name}] 导航失败: ${e}`)
    }
  }

  // 首页应能发起 article/list（不要求有数据）
  try {
    const apiOk = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/v1/article/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1, pageSize: 5, client: true, sort: 'DESC' }),
      })
      return res.ok
    })
    results.push({ name: 'API article/list', ok: apiOk })
    if (!apiOk)
      errors.push('[API] article/list 非 2xx')
  }
  catch (e) {
    errors.push(`[API] article/list 失败: ${e}`)
  }

  await browser.close()

  console.log('\n=== H5 冒烟测试结果 ===')
  for (const r of results) {
    console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.url ? ` (${r.url})` : ''}`)
  }
  if (errors.length) {
    console.log('\n--- 问题 ---')
    errors.forEach(e => console.log(e))
    process.exit(1)
  }
  console.log('\n全部通过')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

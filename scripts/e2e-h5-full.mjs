/**
 * H5 全量浏览器 E2E：已迁移功能冒烟 + 登录态页面
 * 用法：node scripts/e2e-h5-full.mjs
 * 环境变量：SMOKE_BASE_URL、API_BASE、LOGIN_USERNAME、LOGIN_PASSWORD
 */
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const JSEncrypt = require('jsencrypt')
const CryptoJS = require('crypto-js')

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:9000'
const API_BASE = process.env.API_BASE || 'http://localhost:5000/api/v1'
const USERNAME = process.env.LOGIN_USERNAME || '18888888888'
const PASSWORD = process.env.LOGIN_PASSWORD || 'super'

const SERVER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBAQADSwAwSAJBAL9r8jKkfORpiunFylF4XwvNi06sTD3N
4hYLAmGNmviZ1IhCnu4VZ0sShdj7LYfh/Rw5IuqY55XXr6zVB/LzQ70CAwEAAQ==
-----END PUBLIC KEY-----`

function rsaEncrypt(word) {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(SERVER_PUBLIC_KEY)
  const encrypted = encrypt.encrypt(word)
  if (!encrypted)
    throw new Error('RSA encrypt failed')
  return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(encrypted)).toUpperCase()
}

function unwrap(json) {
  if (!json || typeof json !== 'object')
    return json
  if (json.info !== undefined)
    return json.info
  if (json.data !== undefined)
    return json.data
  return json
}

async function apiJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  const json = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error(`${path} HTTP ${res.status}: ${JSON.stringify(json)}`)
  if (json.code !== 0 && json.code !== 200)
    throw new Error(`${path} biz ${json.code}: ${json.message || json.msg}`)
  return unwrap(json)
}

function redisGet(key) {
  try {
    const out = execSync(`redis-cli -n 1 GET ${key}`, { encoding: 'utf8' }).trim()
    return out === '' ? null : out
  }
  catch {
    return null
  }
}

async function loginViaApi() {
  const captcha = await apiJson(`/user/authCode?t=${Date.now()}`)
  const captchaId = captcha.captchaId
  const answer = redisGet(`captcha:${captchaId}`)
  if (!answer)
    throw new Error(`Redis 无验证码答案 captcha:${captchaId}，请确认 Redis 已启动且与 server 同源`)
  const raw = await apiJson('/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginType: 'account',
      username: USERNAME,
      password: rsaEncrypt(PASSWORD),
      authCode: answer,
      captchaId,
    }),
  })
  const loginRes = raw?.info && typeof raw.info === 'object' ? raw.info : raw
  const accessToken = loginRes.accessToken || loginRes.token
  const refreshToken = loginRes.refreshToken || ''
  if (!accessToken)
    throw new Error('登录响应无 accessToken')
  const userInfo = loginRes.user ?? (await fetch(`${API_BASE}/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then(r => r.json()).then(j => unwrap(j)))
  return { accessToken, refreshToken, userInfo }
}

const guestRoutes = [
  { name: '首页', path: 'pages/index/index', expectText: '技术文章' },
  { name: '发现', path: 'pages/explore/explore', expectText: '快速入口' },
  { name: '搜索', path: 'pages/search/search', expectText: '搜索' },
  { name: '关于', path: 'pages/about/about', expectText: 'Blog Home' },
  { name: '登录', path: 'pages/auth/login', expectText: '账号登录' },
  { name: '注册', path: 'pages/auth/register', expectText: '账号注册' },
  { name: 'RPG入口', path: 'pages/rpg/entry', expectText: '冒险' },
  { name: '玩法说明', path: 'pages-rpg/guide/index', expectText: 'RPG 冒险指南' },
  { name: '归档', path: 'pages-blog/archives/index', expectText: '文章归档' },
  { name: '留言板', path: 'pages-blog/msgboard/index', expectText: '留言' },
  { name: '友链', path: 'pages-blog/links/index', expectText: '友链' },
  { name: '开源说明', path: 'pages-blog/open-source/index', expectText: '三端项目' },
  { name: '项目展示', path: 'pages-blog/projects/index', expectText: '项目' },
  { name: '系统特性', path: 'pages-blog/features/index', expectText: '博客系统特性' },
  { name: '工具箱', path: 'pages-tool/index/index', expectText: '实用工具' },
  { name: '编码转换', path: 'pages-tool/codes/index', expectText: '输出' },
  { name: 'RSA', path: 'pages-tool/rsa/index', expectText: '生成密钥对' },
  { name: '对称加密', path: 'pages-tool/crypto/index', expectText: 'AES' },
  { name: 'SM2', path: 'pages-tool/sm/index', expectText: '生成密钥对' },
  { name: '二维码', path: 'pages-tool/qrcode/index', expectText: '重新生成' },
  { name: 'AI摘要', path: 'pages-tool/ai-summary/index', expectText: '生成摘要' },
  { name: '批量水印', path: 'pages-tool/watermark/index', expectText: '水印' },
  { name: 'PDF预览', path: 'pages-tool/pdf/index', expectText: 'PDF' },
  { name: '404', path: 'pages/404/index', expectText: 'Page not found' },
]

async function visitRoute(page, route, errors) {
  const url = `${BASE}/#/${route.path}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(600)
    const body = await page.locator('body').textContent() ?? ''
    const ok = body.includes(route.expectText)
    if (!ok)
      errors.push(`[${route.name}] 未找到期望文案「${route.expectText}」`)
    return { ...route, ok, url }
  }
  catch (e) {
    errors.push(`[${route.name}] 导航失败: ${e}`)
    return { ...route, ok: false, url }
  }
}

async function injectSession(page, session) {
  const { accessToken, refreshToken, userInfo } = session
  await page.goto(`${BASE}/#/pages/index/index`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.evaluate(({ accessToken, refreshToken, userInfo }) => {
    const now = Date.now()
    localStorage.setItem('token', JSON.stringify({
      tokenInfo: {
        accessToken,
        refreshToken,
        accessExpiresIn: 1800,
        refreshExpiresIn: 604800,
      },
    }))
    localStorage.setItem('blog_access_token', accessToken)
    localStorage.setItem('accessTokenExpireTime', String(now + 1800 * 1000))
    localStorage.setItem('refreshTokenExpireTime', String(now + 604800 * 1000))
    const uid = userInfo.id ?? userInfo.uid ?? userInfo.userId
    localStorage.setItem('user', JSON.stringify({
      userInfo: {
        userId: Number(uid),
        username: userInfo.username ?? '',
        nickname: userInfo.nickname ?? userInfo.username ?? '',
        avatar: userInfo.avatar || '/static/images/default-avatar.png',
      },
    }))
  }, { accessToken, refreshToken, userInfo })
}

async function uiLogin(page, errors) {
  try {
    const session = await loginViaApi()
    await injectSession(page, session)
    await page.goto(`${BASE}/#/pages/me/me`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(1500)
    const body = await page.locator('body').textContent() ?? ''
    const ok = body.includes('我的') && (body.includes('个人中心') || body.includes(USERNAME) || body.includes('江夏'))
    if (!ok)
      errors.push('[登录态注入] 我的页未呈现已登录状态')
    return ok ? session : null
  }
  catch (e) {
    errors.push(`[登录态注入] ${e}`)
    return null
  }
}

async function main() {
  const errors = []
  const fatalConsole = []
  const results = []

  // 预拉动态 ID
  let articleId = ''
  let tagId = ''
  let categoryId = ''
  const publicUid = ''
  try {
    const list = await apiJson('/article/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, pageSize: 5, client: true, sort: 'DESC' }),
    })
    articleId = String(list?.list?.[0]?.id ?? '')
    const tags = await apiJson('/tag?isDelete=true')
    tagId = String(tags?.[0]?.id ?? tags?.list?.[0]?.id ?? '')
    const cats = await apiJson('/category?isDelete=true')
    categoryId = String(cats?.[0]?.id ?? cats?.list?.[0]?.id ?? '')
  }
  catch (e) {
    errors.push(`[API预拉] ${e}`)
  }

  if (articleId)
    guestRoutes.push({ name: '文章详情', path: `pages/detail/detail?id=${articleId}`, expectText: '评论' })
  if (tagId)
    guestRoutes.push({ name: '标签列表', path: `pages-blog/tag/list?id=${tagId}`, expectText: '标签' })
  if (categoryId)
    guestRoutes.push({ name: '分类列表', path: `pages-blog/category/list?id=${categoryId}`, expectText: '分类' })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  page.on('pageerror', err => fatalConsole.push(`[pageerror] ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (/favicon|devtools|404.*\.png/i.test(text))
        return
      fatalConsole.push(`[console.error] ${text}`)
    }
  })

  for (const route of guestRoutes) {
    results.push(await visitRoute(page, route, errors))
  }

  // Web 工具跳转页
  results.push(await visitRoute(page, {
    name: '光影边框跳转',
    path: 'pages-tool/h5-web/index?path=/tool/photos&title=光影边框',
    expectText: '光影边框',
  }, errors))

  // UI 登录
  const session = await uiLogin(page, errors)
  results.push({ name: 'API登录注入', ok: !!session })

  if (session) {
    const publicUid = String(session.userInfo?.id ?? session.userInfo?.uid ?? '')

    const authRoutes = [
      { name: '我的', path: 'pages/me/me', expectText: '我的' },
      { name: '个人中心', path: 'pages-blog/user/profile', expectText: '资料' },
      { name: '写文章', path: 'pages-blog/user/article/edit', expectText: '标题' },
      { name: '冒险中心', path: 'pages-rpg/index/index', expectText: '冒险中心' },
    ]
    if (publicUid) {
      const nick = String(session.userInfo?.nickname ?? session.userInfo?.username ?? '收藏')
      authRoutes.push({ name: '公开主页', path: `pages-blog/user/public?uid=${publicUid}`, expectText: nick })
    }

    for (const route of authRoutes) {
      results.push(await visitRoute(page, route, errors))
    }

    // 个人中心 Tab 切换
    await page.goto(`${BASE}/#/pages-blog/user/profile`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(800)
    const tabs = ['文章', '收藏', '评论', '收件箱', '看板']
    for (const tab of tabs) {
      try {
        await page.getByText(tab, { exact: true }).first().click()
        await page.waitForTimeout(500)
        results.push({ name: `个人中心-${tab}`, ok: true })
      }
      catch (e) {
        errors.push(`[个人中心 Tab ${tab}] ${e}`)
        results.push({ name: `个人中心-${tab}`, ok: false })
      }
    }

    // RPG Tab
    await page.goto(`${BASE}/#/pages-rpg/index/index`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(1000)
    const rpgTabs = ['背包', '宠物', '公会', '排行']
    for (const tab of rpgTabs) {
      try {
        await page.getByText(tab, { exact: true }).first().click()
        await page.waitForTimeout(600)
        results.push({ name: `RPG-${tab}`, ok: true })
      }
      catch (e) {
        errors.push(`[RPG Tab ${tab}] ${e}`)
        results.push({ name: `RPG-${tab}`, ok: false })
      }
    }
  }

  await browser.close()

  console.log('\n=== H5 全量 E2E 测试结果 ===')
  for (const r of results)
    console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.url ? ` (${r.url})` : ''}`)

  if (fatalConsole.length) {
    console.log('\n--- 控制台错误 ---')
    fatalConsole.slice(0, 30).forEach(e => console.log(e))
    if (fatalConsole.length > 30)
      console.log(`... 另有 ${fatalConsole.length - 30} 条`)
  }

  if (errors.length) {
    console.log('\n--- 失败项 ---')
    errors.forEach(e => console.log(e))
    process.exit(1)
  }

  if (fatalConsole.length)
    process.exit(1)

  console.log('\n全部通过')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

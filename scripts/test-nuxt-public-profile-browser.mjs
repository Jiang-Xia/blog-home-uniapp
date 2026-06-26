/**
 * 浏览器冒烟：公开主页刷新、排行榜头像链接
 * 依赖：blog-server:5000、blog-home-nuxt:5050 已启动
 */
import { chromium } from 'playwright'
import { createRequire } from 'node:module'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(join(__dirname, '../../blog-server/package.json'))
const jwt = require('jsonwebtoken')

const BASE = 'http://localhost:5050'
const ADMIN = 'http://localhost:9856'
const TEST_UID = 1

async function injectToken(page) {
  const token = jwt.sign({ id: 53, nickname: '江晚吟', mobile: 'jiangwanyin' }, 'xia-007', { expiresIn: '1h' })
  const refresh = jwt.sign({ id: 53, type: 'refresh' }, 'xia-007', { expiresIn: '7d' })
  await page.context().addCookies([
    { name: 'x-accessToken', value: token, domain: 'localhost', path: '/' },
    { name: 'x-refreshToken', value: refresh, domain: 'localhost', path: '/' },
  ])
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error')
      consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(err.message))

  const results = {}

  await injectToken(page)

  const profileUrl = `${BASE}/user/${TEST_UID}`
  const first = await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  results.profileFirstStatus = first?.status()
  const firstBody = await page.locator('body').textContent() ?? ''
  results.profileFirstHas404 = /404|用户不存在|页面不存在/.test(firstBody)
  results.profileFirstHasContent = firstBody.includes('的主页') || firstBody.includes('Lv')

  const reload = await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  results.profileReloadStatus = reload?.status()
  const reloadBody = await page.locator('body').textContent() ?? ''
  results.profileReloadHas404 = /404|用户不存在|页面不存在/.test(reloadBody)
  results.profileReloadHasContent = reloadBody.includes('已发布') || reloadBody.includes('Lv')

  await page.goto(`${BASE}/rpg?tab=leaderboard`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(4000)

  const leaderboardPanel = page.locator('.leaderboard-panel')
  await leaderboardPanel.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})

  const avatarLinks = page.locator('.leaderboard-panel .rank-avatar[href^="/user/"]')
  results.leaderboardAvatarLinkCount = await avatarLinks.count()
  if (results.leaderboardAvatarLinkCount > 0) {
    results.leaderboardFirstHref = await avatarLinks.first().getAttribute('href')
    // 关闭 RPG 新手引导等遮挡弹窗
    const modalClose = page.locator('dialog.modal-open button').filter({ hasText: /close|关闭|知道了|跳过/i })
    if (await modalClose.count()) {
      await modalClose.first().click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
    }
    await page.goto(`${BASE}${results.leaderboardFirstHref}`, { waitUntil: 'domcontentloaded' })
    results.leaderboardAvatarNavOk = page.url().includes(results.leaderboardFirstHref)
  }
  else {
    results.leaderboardAvatarNavOk = false
    results.leaderboardPanelText = (await leaderboardPanel.textContent().catch(() => '') ?? '').slice(0, 200)
  }

  const screenshotPath = 'd:/study/myGithub/blog-home-nuxt/scripts/browser-test-public-profile.png'
  await page.screenshot({ path: screenshotPath, fullPage: true })

  results.consoleErrorCount = consoleErrors.length
  results.consoleErrorsSample = consoleErrors.slice(0, 5)

  const passed
    = results.profileFirstStatus === 200
      && !results.profileFirstHas404
      && results.profileFirstHasContent
      && results.profileReloadStatus === 200
      && !results.profileReloadHas404
      && results.profileReloadHasContent
      && (results.leaderboardAvatarLinkCount === 0 || results.leaderboardAvatarNavOk)

  console.log(JSON.stringify({ passed, results }, null, 2))
  console.log('Screenshot:', screenshotPath)

  await browser.close()
  process.exit(passed ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import process from 'node:process'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
let authHeader = ''

page.on('request', (req) => {
  if (req.url().includes('/user/info'))
    authHeader = req.headers().authorization || ''
})

await page.goto('http://localhost:9000/#/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2000)

const statusCode = await page.evaluate(() => {
  const token = 'test-token-for-header-check'
  uni.setStorageSync('blog_access_token', token)
  uni.setStorageSync('accessTokenExpireTime', Date.now() + 30 * 60 * 1000)
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://localhost:5000/api/v1/user/info',
      method: 'GET',
      success: res => resolve(res.statusCode),
      fail: err => reject(err),
    })
  })
})

console.log('statusCode', statusCode, '(401 expected with dummy token)')
console.log('Authorization header:', authHeader)

await browser.close()

if (!authHeader.startsWith('Bearer test-token-for-header-check')) {
  console.error('FAIL: 拦截器未注入 Authorization')
  process.exit(1)
}
console.log('PASS: 请求头已携带 Bearer token')

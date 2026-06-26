import { execSync } from 'node:child_process'
import { chromium } from 'playwright'

async function getCaptcha() {
  const capRes = await fetch(`http://localhost:5000/api/v1/user/authCode?t=${Date.now()}`)
  const capJson = await capRes.json()
  const captchaId = capJson.data.captchaId
  const authCode = execSync(`redis-cli GET captcha:${captchaId}`, { encoding: 'utf8' }).trim()
  return { captchaId, authCode }
}

const authLogs = []
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on('request', (req) => {
  if (req.url().includes('/user/login') || req.url().includes('/user/info')) {
    authLogs.push({
      kind: 'request',
      method: req.method(),
      url: req.url(),
      authorization: req.headers().authorization || '(missing)',
    })
  }
})

page.on('response', async (res) => {
  if (res.url().includes('/user/login') || res.url().includes('/user/info')) {
    authLogs.push({
      kind: 'response',
      status: res.status(),
      url: res.url(),
      body: (await res.text()).slice(0, 400),
    })
  }
})

await page.goto('http://localhost:9000/#/pages/auth/login', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const { captchaId, authCode } = await getCaptcha()
console.log('captcha', authCode, captchaId)

// inject login via app's tokenStore path
const loginResult = await page.evaluate(async ({ username, password, authCode, captchaId }) => {
  // dynamic import won't work easily; use fetch mimicking app
  const { enc } = await import('https://esm.sh/crypto-js@4.2.0')
  const JSEncrypt = (await import('https://esm.sh/jsencrypt@3.5.4')).default
  const pub = `-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL9r8jKkfORpiunFylF4XwvNi06sTD3N\n4hYLAmGNmviZ1IhCnu4VZ0sShdj7LYfh/Rw5IuqY55XXr6zVB/LzQ70CAwEAAQ==\n-----END PUBLIC KEY-----`
  const e = new JSEncrypt()
  e.setPublicKey(pub)
  const encrypted = e.encrypt(password)
  const pwd = enc.Hex.stringify(enc.Base64.parse(encrypted)).toUpperCase()

  const loginRes = await fetch('http://localhost:5000/api/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginType: 'account', username, password: pwd, authCode, captchaId }),
  })
  const loginJson = await loginRes.json()

  // simulate token store + info fetch WITHOUT header
  const data = loginJson.data
  const accessToken = data?.info?.accessToken ?? data?.accessToken
  const infoNoHeader = await fetch('http://localhost:5000/api/v1/user/info')
  const infoWithHeader = await fetch('http://localhost:5000/api/v1/user/info', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return {
    loginJson,
    accessToken: accessToken?.slice(0, 30),
    infoNoHeader: infoNoHeader.status,
    infoWithHeader: infoWithHeader.status,
    dataKeys: data ? Object.keys(data) : [],
  }
}, { username: 'jiangwanyin', password: '123456', authCode, captchaId })

console.log('loginResult', JSON.stringify(loginResult, null, 2))

// Now test via uni.request interceptor - trigger tokenStore login from page if possible
// Use pinia from window - expose by evaluating after app load
await page.evaluate(async ({ username, password, authCode, captchaId }) => {
  const app = document.querySelector('#app')?.__vue_app__
  if (!app)
    return { err: 'no app' }
  const pinia = app.config.globalProperties.$pinia || app._context?.provides?.pinia
  if (!pinia)
    return { err: 'no pinia' }
  // can't easily get stores
  return { hasApp: true }
}, { username: 'jiangwanyin', password: '123456', authCode, captchaId })

await browser.close()

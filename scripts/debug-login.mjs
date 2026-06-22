import { execSync } from 'node:child_process'
import process from 'node:process'
import { enc } from 'crypto-js'
import JSEncrypt from 'jsencrypt'

const pub = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL9r8jKkfORpiunFylF4XwvNi06sTD3N
4hYLAmGNmviZ1IhCnu4VZ0sShdj7LYfh/Rw5IuqY55XXr6zVB/LzQ70CAwEAAQ==
-----END PUBLIC KEY-----`

function rsaEncrypt(word) {
  const e = new JSEncrypt()
  e.setPublicKey(pub)
  const encrypted = e.encrypt(word)
  return enc.Hex.stringify(enc.Base64.parse(encrypted)).toUpperCase()
}

const capRes = await fetch(`http://localhost:5000/api/v1/user/authCode?t=${Date.now()}`)
const capJson = await capRes.json()
const captchaId = capJson.data.captchaId
console.log('captchaId', captchaId)

// read captcha from redis via redis-cli if available
let authCode = ''
try {
  authCode = execSync(`redis-cli GET captcha:${captchaId}`, { encoding: 'utf8' }).trim()
}
catch (e) {
  console.error('redis-cli failed', e.message)
  process.exit(1)
}
console.log('authCode from redis', authCode)

const loginRes = await fetch('http://localhost:5000/api/v1/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    loginType: 'account',
    username: 'jiangwanyin',
    password: rsaEncrypt('123456'),
    authCode,
    captchaId,
  }),
})
const loginJson = await loginRes.json()
console.log('login response', JSON.stringify(loginJson, null, 2))

const accessToken = loginJson.data?.info?.accessToken || loginJson.data?.accessToken
console.log('accessToken present', !!accessToken)

const infoRes = await fetch('http://localhost:5000/api/v1/user/info', {
  headers: { Authorization: `Bearer ${accessToken}` },
})
console.log('info with token', infoRes.status, await infoRes.text())

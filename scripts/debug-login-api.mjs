import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { enc } from 'crypto-js'

const require = createRequire(import.meta.url)
const JSEncrypt = require('jsencrypt/bin/jsencrypt.min.js')

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

const capJson = await (await fetch(`http://localhost:5000/api/v1/user/authCode?t=${Date.now()}`)).json()
const captchaId = capJson.data.captchaId
let authCode = ''
try {
  authCode = execSync(`redis-cli GET captcha:${captchaId}`, { encoding: 'utf8' }).trim()
}
catch {
  // redis 不可用时继续
}

if (!authCode) {
  console.log('No redis captcha, trying login with dummy to see error shape')
}

const loginJson = await (await fetch('http://localhost:5000/api/v1/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    loginType: 'account',
    username: 'jiangwanyin',
    password: rsaEncrypt('123456'),
    authCode: authCode || 'test',
    captchaId,
  }),
})).json()

console.log(JSON.stringify(loginJson, null, 2))

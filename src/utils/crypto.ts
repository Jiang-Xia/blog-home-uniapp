/**
 * AES 加解密（对齐 blog-home-nuxt/utils/crypto.ts，供 AI 摘要 params 预填等）
 */
import CryptoJS from 'crypto-js'

const secretKey = '54050000778e380000fe5a120000b4ce'
const iv = 'jiangxia'

/** AES 加密，返回 16 进制大写字符串 */
export function aesEncrypt(word: string, key = secretKey, offset = iv) {
  const wordUTF8 = CryptoJS.enc.Utf8.parse(word)
  const keyUTF8 = CryptoJS.enc.Utf8.parse(key)
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset)
  const encrypted = CryptoJS.AES.encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString(CryptoJS.format.Hex).toUpperCase()
}

/** AES 解密，返回 UTF-8 字符串 */
export function aesDecrypt(encryptedWord: string, key = secretKey, offset = iv) {
  const keyUTF8 = CryptoJS.enc.Utf8.parse(key)
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset)
  const parsed = CryptoJS.format.Hex.parse(encryptedWord)
  const bytes = CryptoJS.AES.decrypt(parsed, keyUTF8, {
    iv: offsetUTF8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return bytes.toString(CryptoJS.enc.Utf8)
}

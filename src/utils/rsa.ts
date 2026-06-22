import { enc } from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import { serverPublicKey } from '@/config/ssh'

/** RSA 加密为 Hex 或 Base64（对齐 Nuxt rsaEncrypt） */
export function rsaEncrypt(word: string, pubKey = serverPublicKey, type: 'Hex' | 'Base64' = 'Hex'): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(pubKey)
  const encrypted = encrypt.encrypt(word)
  if (!encrypted)
    return word
  if (type === 'Hex')
    return enc.Hex.stringify(enc.Base64.parse(encrypted)).toUpperCase()
  return encrypted
}

/** RSA 解密（Hex 或 Base64 密文） */
export function rsaDecrypt(encryptedWord: string, priKey: string, type: 'Hex' | 'Base64' = 'Hex'): string {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(priKey)
  if (type === 'Hex') {
    const base64 = enc.Base64.stringify(enc.Hex.parse(encryptedWord))
    return decrypt.decrypt(base64) || ''
  }
  return decrypt.decrypt(encryptedWord) || ''
}

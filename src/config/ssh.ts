/** 服务端 RSA 公钥（与 Nest/Nuxt 一致，用于密码加密；gatewayCrypto=aes） */
export const serverPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoyuytldk/BDUvuGUDwW
RplrndYgD0rS+5iP3OOMLH6peR/mjCNkeBQWHmXMfl6KXfwNncYkqtUzANqE7fOv
AoYtiDsnoCAhifhCqIp8+6a0k4WfPztOMSfXyWsTKG85kyMseXE1EWQ+Dy5C0WA8
7adrEr2ceR+jPbsWZA1byQfaL/sHTm9DrcP3QNM9RSVG5tiRQlG8cGSuM3WaKKsA
Fp6wIfkDfKkTXLxQq8C+foFciklA9bCy7gy8k9myT7n+6XIjAIOxeGhcGavB6fAW
wKSr0Q6iopAGJBye+/4pdeuJjdr2MkYR6442lSuBTmNdYKJv/4r3TSGG5u9Inl57
owIDAQAB
-----END PUBLIC KEY-----`

/** 服务端 SM2 公钥（gatewayCrypto=gm 时密码加密） */
export const serverSm2PublicKey = '0405cb0f1a59c22f9dadf6d000f084388df10a413cdcc34578b140e1d9f7478315e9785e9f4428864c571cc3b593ec519b5d3f282178b8bfb581f963c7429e5d45'

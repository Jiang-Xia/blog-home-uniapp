import { describe, expect, it } from 'vitest'
import { normalizeLoginPayload, pickAccessToken, pickRefreshToken } from '@/utils/auth-token'

describe('auth token parsing', () => {
  it('unwraps info wrapper', () => {
    const payload = normalizeLoginPayload({
      info: { accessToken: 'at', refreshToken: 'rt', token: 'legacy', user: {} },
    })
    expect(pickAccessToken(payload)).toBe('at')
    expect(pickRefreshToken(payload)).toBe('rt')
  })

  it('supports flat login payload', () => {
    const payload = normalizeLoginPayload({
      accessToken: 'at2',
      refreshToken: 'rt2',
      user: {},
    })
    expect(pickAccessToken(payload)).toBe('at2')
  })

  it('falls back to legacy token field', () => {
    const payload = normalizeLoginPayload({ token: 'legacy-only', refreshToken: 'rt' })
    expect(pickAccessToken(payload)).toBe('legacy-only')
  })
})

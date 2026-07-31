import { Platform } from 'react-native'
import { env } from '@/config/env'

/** The host each platform reaches the backend through, per `src/config/env.ts`. */
const EXPECTED_DEFAULT_HOST =
  Platform.OS === 'android' ? '10.0.2.2' : 'localhost'

describe('env', () => {
  it('resolves an api base url without a trailing slash', () => {
    expect(env.apiBaseUrl).toMatch(/^https?:\/\/.+[^/]$/)
  })

  it('points at the backend with the global api prefix already on it', () => {
    expect(env.apiBaseUrl).toBe(`${env.apiOrigin}/api/v1`)
  })

  it('falls back to the emulator host for the running platform', () => {
    // `.env` leaves API_HOST and API_BASE_URL empty, which is the emulator and
    // simulator setup; a physical device sets API_HOST to a LAN address.
    expect(env.apiOrigin).toBe(`http://${EXPECTED_DEFAULT_HOST}:3000`)
  })

  it('gives requests a finite timeout so a dead backend fails instead of hanging', () => {
    expect(env.apiTimeoutMs).toBeGreaterThan(0)
    expect(Number.isFinite(env.apiTimeoutMs)).toBe(true)
  })
})

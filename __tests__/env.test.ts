import { Platform } from 'react-native'
import { env, resolveBuildTarget, resolveOrigin } from '@/config/env'

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
    // `.env.test` leaves BUILD_TARGET, API_HOST and API_BASE_URL empty, which
    // is the emulator and simulator setup; a physical device sets API_HOST to
    // a LAN address.
    expect(env.buildTarget).toBe('development')
    expect(env.apiOrigin).toBe(`http://${EXPECTED_DEFAULT_HOST}:3000`)
  })

  it('gives requests a finite timeout so a dead backend fails instead of hanging', () => {
    expect(env.apiTimeoutMs).toBeGreaterThan(0)
    expect(Number.isFinite(env.apiTimeoutMs)).toBe(true)
  })
})

describe('resolveBuildTarget', () => {
  it('defaults to development when unset or blank', () => {
    expect(resolveBuildTarget(undefined)).toBe('development')
    expect(resolveBuildTarget('  ')).toBe('development')
  })

  it('recognises production regardless of case and whitespace', () => {
    expect(resolveBuildTarget(' Production ')).toBe('production')
  })
})

describe('resolveOrigin', () => {
  it('points production at the Cloudflare Tunnel over https', () => {
    expect(resolveOrigin({ BUILD_TARGET: 'production' })).toBe(
      'https://api.derekcantillo.com',
    )
  })

  it('ignores local overrides in production', () => {
    expect(
      resolveOrigin({
        BUILD_TARGET: 'production',
        API_BASE_URL: 'http://192.168.1.20:3000',
        API_HOST: '192.168.1.20',
        API_PORT: '4000',
      }),
    ).toBe('https://api.derekcantillo.com')
  })

  it('uses the LAN host and port in development', () => {
    expect(
      resolveOrigin({
        BUILD_TARGET: 'development',
        API_HOST: '192.168.1.20',
        API_PORT: '4000',
      }),
    ).toBe('http://192.168.1.20:4000')
  })

  it('lets API_BASE_URL override the host in development, prefix or not', () => {
    expect(
      resolveOrigin({ API_BASE_URL: 'https://tunnel.example/api/v1/' }),
    ).toBe('https://tunnel.example')
  })
})

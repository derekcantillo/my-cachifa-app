import { env } from '@/config/env'

describe('env', () => {
  it('resolves an api base url without a trailing slash', () => {
    expect(env.apiBaseUrl).toMatch(/^https?:\/\/.+[^/]$/)
  })
})

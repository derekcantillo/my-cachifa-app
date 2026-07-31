import { Platform } from 'react-native'
import { API_BASE_URL, API_HOST, API_PORT, API_TIMEOUT_MS } from '@env'

/**
 * Where `my-cachifa-backend` lives, resolved for the three ways this app runs.
 * Nothing but the host changes between them, so `.env` normally only needs
 * `API_HOST` — and only for the third case.
 *
 *   1. Android emulator  → http://10.0.2.2:3000
 *      The emulator is its own VM; 10.0.2.2 is the alias for the host machine.
 *      Nothing to configure.
 *
 *   2. iOS simulator     → http://localhost:3000
 *      Shares the network stack of the Mac, so localhost is the backend.
 *      Nothing to configure.
 *
 *   3. Physical device   → http://<LAN IP>:3000
 *      Neither alias exists on a real phone, so set `API_HOST` in `.env` to
 *      the LAN address of the machine running the backend, e.g.
 *      `API_HOST=192.168.1.20` (find it with `ipconfig getifaddr en0`). Phone
 *      and machine must be on the same Wi-Fi, and the backend already listens
 *      on 0.0.0.0, so no change is needed on its side.
 *
 * `API_BASE_URL` overrides all three at once when the backend is somewhere
 * else entirely (a tunnel, a staging host).
 */
const DEFAULT_PORT = 3000

/** Nest mounts every route under this prefix (`app.setGlobalPrefix`). */
const API_PREFIX = '/api/v1'

const DEFAULT_TIMEOUT_MS = 10_000

/** Host that reaches the machine running the backend, per platform. */
const EMULATOR_HOSTS = {
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
} as const

function readValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** The origin, whether `.env` spelled it with the API prefix or without it. */
function toOrigin(url: string): string {
  return stripTrailingSlash(stripTrailingSlash(url).replace(/\/api\/v1$/, ''))
}

function resolvePort(): number {
  const parsed = Number(readValue(API_PORT))
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT
}

function resolveOrigin(): string {
  const configuredUrl = readValue(API_BASE_URL)
  if (configuredUrl) {
    return toOrigin(configuredUrl)
  }

  const host =
    readValue(API_HOST) ??
    Platform.select(EMULATOR_HOSTS) ??
    EMULATOR_HOSTS.default

  return `http://${host}:${resolvePort()}`
}

function resolveTimeoutMs(): number {
  const parsed = Number(readValue(API_TIMEOUT_MS))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS
}

const apiOrigin = resolveOrigin()

export const env = {
  /** Scheme, host and port only — no path. */
  apiOrigin,
  /** What `httpClient` uses as its `baseURL`, prefix included. */
  apiBaseUrl: `${apiOrigin}${API_PREFIX}`,
  /** How long a request may hang before it fails as a timeout. */
  apiTimeoutMs: resolveTimeoutMs(),
  isDev: __DEV__,
} as const

export type Env = typeof env

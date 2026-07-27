import { Platform } from 'react-native'
import { API_BASE_URL } from '@env'

/**
 * Default host used when no `API_BASE_URL` is provided in `.env`.
 *
 * - Android emulator reaches the host machine through the special 10.0.2.2 alias.
 * - iOS simulator shares the host network stack, so localhost works directly.
 *
 * A physical device can reach neither, so it must set `API_BASE_URL` in `.env`
 * to the LAN address of the machine running the backend (e.g. http://192.168.1.20:3000).
 */
const DEFAULT_BACKEND_PORT = 3000

const EMULATOR_HOSTS = {
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
} as const

function resolveApiBaseUrl(): string {
  const configured = API_BASE_URL?.trim()

  if (configured) {
    return stripTrailingSlash(configured)
  }

  const host = Platform.select(EMULATOR_HOSTS) ?? EMULATOR_HOSTS.default

  return `http://${host}:${DEFAULT_BACKEND_PORT}`
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  isDev: __DEV__,
} as const

export type Env = typeof env

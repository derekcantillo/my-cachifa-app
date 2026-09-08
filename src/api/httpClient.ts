import axios, { AxiosError } from 'axios'
import { env } from '@/config/env'
import { setHasApiKey } from './apiKeyGate'
import { ApiError, type ApiErrorKind } from './apiError'
import { clearApiKey, getApiKey } from './secureStorage'

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
})

let authToken: string | null = null

/**
 * The backend doesn't expose authentication yet. This lets a future login
 * flow attach a bearer token without touching any repository call site.
 */
export function setAuthToken(token: string | null): void {
  authToken = token
}

/**
 * The key rarely changes, so the first successful Keychain read is kept here
 * instead of hitting Keychain on every request. `setApiKeyCache` lets the
 * setup screen and "Cambiar API Key" push a fresh value (or `null`) in
 * without waiting for an app restart.
 */
let cachedApiKey: string | null = null

export function setApiKeyCache(key: string | null): void {
  cachedApiKey = key
}

async function resolveApiKey(): Promise<string | null> {
  if (cachedApiKey) {
    return cachedApiKey
  }
  const key = await getApiKey()
  cachedApiKey = key
  return key
}

/** The backend only exempts `/health` from the `X-API-Key` requirement. */
function requiresApiKey(url: string | undefined): boolean {
  return !url?.replace(/\/+$/, '').endsWith('/health')
}

httpClient.interceptors.request.use(async config => {
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`)
  }

  if (requiresApiKey(config.url)) {
    const apiKey = await resolveApiKey()
    if (!apiKey) {
      return Promise.reject(
        new ApiError('apiKeyMissing', 'API key no configurada'),
      )
    }
    config.headers.set('X-API-Key', apiKey)
  }

  return config
})

/** Shape of the body the backend's exception filter sends on every error. */
interface ApiErrorBody {
  statusCode?: number
  message?: string | string[]
}

/**
 * The API sends `message` as a string, or as the list of every failed
 * validation rule. Only the first one is worth showing inline.
 */
function readMessage(data: unknown): string | undefined {
  if (typeof data === 'string') {
    return data
  }
  if (!data || typeof data !== 'object') {
    return undefined
  }

  const { message } = data as ApiErrorBody
  if (Array.isArray(message)) {
    return message[0]
  }
  return message
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'notFound'
  if (status >= 500) return 'server'
  if (status >= 400) return 'validation'
  return 'unknown'
}

function kindForTransport(error: AxiosError): ApiErrorKind {
  // Axios reports a timeout as ECONNABORTED (or ETIMEDOUT on some engines) and
  // a dead host / no network as ERR_NETWORK, both without a response.
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'timeout'
  }
  return 'offline'
}

/**
 * Turns anything axios rejects with into an `ApiError`. Repositories and
 * screens only ever see the domain error, so a dead backend, a timeout and a
 * rejected payload all reach the UI through the same channel the mocks used.
 */
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    return new ApiError(
      'unknown',
      error instanceof Error ? error.message : undefined,
    )
  }

  const { response } = error
  if (!response) {
    return new ApiError(kindForTransport(error), undefined, {
      details: error.code,
    })
  }

  const kind = kindForStatus(response.status)

  return new ApiError(
    kind,
    // A validation message names the field that is wrong, so it is worth
    // surfacing; a 404 or a stack trace from a 500 is not.
    kind === 'validation' ? readMessage(response.data) : undefined,
    { status: response.status, details: response.data },
  )
}

/**
 * A 401 means the key Keychain has is missing or was revoked — no retry or
 * screen-level message fixes that. Wiping it here, once, sends every screen
 * back to `ApiKeySetupScreen` via the same gate `App.tsx` checks at startup,
 * instead of each of the five screens needing its own recovery affordance.
 */
async function handleUnauthorized(): Promise<void> {
  cachedApiKey = null
  await clearApiKey()
  setHasApiKey(false)
}

httpClient.interceptors.response.use(
  response => response,
  async (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.kind === 'unauthorized') {
      // Awaited so the gate has already flipped by the time the caller's
      // `catch` runs — screens re-render into `ApiKeySetupScreen` before,
      // not after, they'd otherwise flash their own error state.
      await handleUnauthorized()
    }
    return Promise.reject(apiError)
  },
)

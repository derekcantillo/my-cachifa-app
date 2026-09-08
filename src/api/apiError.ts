/**
 * Every failure that comes out of the HTTP layer is one of these, so screens
 * keep showing errors the way they already do with the mocks: `ErrorNotice`
 * renders `error.message`, and the message is written for the person holding
 * the phone, not for a log.
 */
export type ApiErrorKind =
  /** The request never reached the server: no network, wrong host, backend off. */
  | 'offline'
  /** The server took longer than the client is willing to wait. */
  | 'timeout'
  /** 404 — the resource is gone. Repositories turn this into `null`. */
  | 'notFound'
  /** 4xx the caller can fix, e.g. a rejected payload. Carries the API message. */
  | 'validation'
  /** 5xx — the backend broke. */
  | 'server'
  /** No API key in Keychain yet — the request never left the device. */
  | 'apiKeyMissing'
  /** 401 from the backend — the key it has is missing or wrong, not the payload. */
  | 'unauthorized'
  | 'unknown'

const MESSAGES: Record<ApiErrorKind, string> = {
  offline:
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  timeout: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  notFound: 'No encontramos lo que buscabas.',
  validation: 'Revisa los datos e inténtalo de nuevo.',
  server: 'El servidor tuvo un problema. Inténtalo más tarde.',
  apiKeyMissing: 'API key no configurada.',
  unauthorized: 'Problema de autenticación. Verifica tu API Key.',
  unknown: 'Algo salió mal. Vuelve a intentarlo.',
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  /** HTTP status, when the request got far enough to have one. */
  readonly status?: number
  /** Whatever the API sent as the body, kept for debugging. */
  readonly details?: unknown

  constructor(
    kind: ApiErrorKind,
    message?: string,
    options: { status?: number; details?: unknown } = {},
  ) {
    super(message?.trim() || MESSAGES[kind])
    this.name = 'ApiError'
    this.kind = kind
    if (options.status !== undefined) {
      this.status = options.status
    }
    if (options.details !== undefined) {
      this.details = options.details
    }
    // Restores the prototype chain, which `extends Error` loses when the code
    // is downlevelled — without it `instanceof ApiError` is false.
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** True for the 404 a repository turns into `null` instead of rethrowing. */
export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.kind === 'notFound'
}

/** True when a request was rejected locally because Keychain has no API key. */
export function isApiKeyMissingError(error: unknown): boolean {
  return isApiError(error) && error.kind === 'apiKeyMissing'
}

/** True when the backend itself rejected the request with 401. */
export function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.kind === 'unauthorized'
}

/** Default copy for a kind, for callers that want it without an instance. */
export function getApiErrorMessage(kind: ApiErrorKind): string {
  return MESSAGES[kind]
}

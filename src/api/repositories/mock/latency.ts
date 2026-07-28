import { MOCK_FAILURE_RATE } from '@env'

/** Simulates network latency so mock loading states behave like the real API. */
export function simulateLatency(minMs = 300, maxMs = 800): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Share of mock writes that fail, 0-1. Off by default; set `MOCK_FAILURE_RATE`
 * in `.env` to exercise the error states of the mutation screens.
 */
function resolveFailureRate(): number {
  const parsed = Number(MOCK_FAILURE_RATE)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return Math.min(Math.max(parsed, 0), 1)
}

const failureRate = resolveFailureRate()

/** Message the mock rejects with, worded like something a user can act on. */
export const MOCK_WRITE_ERROR_MESSAGE =
  'No pudimos guardar los cambios. Vuelve a intentarlo.'

/**
 * Latency plus the configured chance of failure. Mock writes go through this
 * instead of `simulateLatency` so the app can be driven into its error states.
 */
export async function simulateWrite(): Promise<void> {
  await simulateLatency()

  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error(MOCK_WRITE_ERROR_MESSAGE)
  }
}

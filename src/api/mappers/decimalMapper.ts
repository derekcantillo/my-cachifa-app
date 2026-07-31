/**
 * Money crosses the wire as a Prisma `Decimal(12,2)`. Nest serialises it with
 * `.toNumber()` on every response DTO today, but a Decimal that reaches
 * `JSON.stringify` unconverted comes out as a *string* — which is what happens
 * the moment an endpoint returns a raw Prisma row or an aggregate. Screens
 * format amounts with `Intl.NumberFormat` and sum them, so a string leaking
 * through renders as `NaN` or as a concatenation.
 *
 * Every amount read from the API therefore goes through here, whatever the
 * declared type of the field says.
 */

/**
 * Amount as a number, from either the `number` or the `"123.45"` a Decimal
 * serialises to. Missing or unparseable values become `fallback` (0 by
 * default) so no arithmetic downstream can produce `NaN`.
 */
export function toAmount(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

/** Same as `toAmount`, but keeps a genuinely absent value absent. */
export function toOptionalAmount(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return toAmount(value)
}

/**
 * A percentage the backend already computed, clamped to a sane range so a
 * progress bar never draws past its track on unexpected input.
 */
export function toPercentage(value: unknown): number {
  return Math.max(0, toAmount(value))
}
